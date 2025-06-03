import { Injectable } from '@nestjs/common';
import { CreateCuppingRequestDto, CuppingStatus, GetCuppingsListResponseDto, IGetCuppingSampleResponse, IGetCuppingSampleTest, IGetCuppingsListResponse, IGetCuppingStatusResponse, IStatusResponse, ISuccessIdResponse, SetCuppingStatusRequestDto, SetCuppingTestRequestDto, SetCuppingTestsRequestDto, StatusResponseDto, StatusType, TestType } from './dto';
import { ErrorHandlingService } from 'src/app.common/error-handling/error-handling.service';
import { PrismaService } from 'src/app.common/services/prisma/prisma.service';
import { Cupping, CuppingType, PropertyType, Role, SampleProperty, SampleTesting } from '@prisma/client';
import { MappingService } from 'src/app.common/services/mapping.service';
import { IGetCuppingResponse } from './dto/get-cupping.response.dto';
import { LocalizationStringsService } from 'src/app.common/localization/localization-strings.service';
import { BusinessErrorKeys, CuppingKeys } from 'src/app.common/localization/generated';

@Injectable()
export class CuppingService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly errorHandlingService: ErrorHandlingService,
        private localizationStringsService: LocalizationStringsService,
        private mappingService: MappingService
    ) { }

    async createCupping(
        userId: number,
        currentCompanyId: number,
        dto: CreateCuppingRequestDto
    ): Promise<IStatusResponse> {
        const { samples, settings, chosenUserIds } = dto;

        // Determine invited users
        const invitedUserIds = settings.inviteAllTeammates
            ? (
                await this.prisma.userToCompanyRelation.findMany({
                    where: { companyId: currentCompanyId },
                    select: { userId: true },
                })
            )
                .map(r => r.userId)
            : chosenUserIds;

        // Add current user to the array 
        if (invitedUserIds.some(ids => ids == userId)) {
            invitedUserIds.push(userId);
        }

        try {
            const [created] = await this.prisma.$transaction([
                // 1) Create cupping + nested settings + connect relations
                this.prisma.cupping.create({
                    data: {
                        cuppingCreator: { connect: { id: userId } },
                        cuppingName: settings.cuppingName,
                        cuppingType: CuppingType.CREATED,
                        company: { connect: { id: currentCompanyId } },
                        settings: {
                            create: {
                                randomSamplesOrder: settings.randomSamplesOrder,
                                openSampleNameCupping: settings.openSampleNameCupping,
                                singleUserCupping: settings.singleUserCupping,
                                inviteAllTeammates: settings.inviteAllTeammates,
                                company: { connect: { id: currentCompanyId } },
                                user: { connect: { id: userId } },
                            },
                        },
                        coffeePacks: {
                            connect: samples.map(s => ({ id: s.packId })),
                        },
                    },
                }),
            ]);

            // 2) Add Hidden sample names
            if (!settings.openSampleNameCupping) {
                await this.prisma.cuppingHiddenPackName.createMany({
                    data: samples.map(sample => ({
                        cuppingId: created.id,
                        coffeePackId: sample.packId,
                        coffeePackName: sample.hiddenSampleName
                    })),
                    skipDuplicates: true,
                });
            }

            // 3) Bulk create invitations, skip duplicates
            await this.prisma.cuppingInvitation.createMany({
                data: invitedUserIds.map(uId => ({ cuppingId: created.id, userId: uId })),
                skipDuplicates: true,
            })

            return {
                status: StatusType.SUCCESS,
                description: await this.localizationStringsService.getCuppingText(
                    CuppingKeys.CREATE_CUPPING_SUCCESS,
                    { cuppingId: created.id }
                )
            };
        } catch (error) {
            throw await this.errorHandlingService.getBusinessError(
                BusinessErrorKeys.REQUEST_VALIDATION_ERROR
            );
        }
    }

    async getCuppingsList(
        userId: number,
        currentCompanyId: number
    ): Promise<IGetCuppingsListResponse> {
        try {
            const cuppings = await this.prisma.cupping.findMany({
                where: { companyId: currentCompanyId },
                include: {
                    settings: true,
                    sampleTestings: { select: { userId: true } }
                },
                orderBy: { createdAt: 'desc' },
            });

            return {
                cuppings: cuppings.map(cupping => this.mappingService.mapCupping(
                    cupping as Cupping & { settings: any },
                    this.hasUserEndTesting(cupping, userId)
                ))
            };
        } catch (error) {
            throw await this.errorHandlingService.getBusinessError(
                BusinessErrorKeys.REQUEST_VALIDATION_ERROR
            );
        }
    }

    async getCupping(
        userId: number,
        currentCompanyId: number,
        cuppingId: number,
    ): Promise<IGetCuppingResponse> {
        try {
            const cupping = await this.prisma.cupping.findUnique({
                where: { id: cuppingId },
                include: {
                    cuppingCreator: true,
                    settings: true,
                    invitations: { select: { userId: true } },
                    coffeePacks: { include: { sampleType: true } },
                    sampleTestings: {
                        where: { userId },
                        include: {
                            coffeePack: true,
                            userSampleProperties: true,
                        },
                    },
                    cuppingHiddenPackNames: true,
                    cuppingResult: {
                        include: {
                            cuppingSampleTestingPropertyResult: true,
                        },
                    },
                },
            });

            const relation = await this.prisma.userToCompanyRelation.findUnique({
                where: {
                    userId_companyId: {
                        userId,
                        companyId: currentCompanyId,
                    },
                }
            });

            if (!cupping || cupping.companyId !== currentCompanyId) {
                throw await this.errorHandlingService.getBusinessError(
                    BusinessErrorKeys.REQUEST_VALIDATION_ERROR,
                );
            }
            const invitedIds = cupping.invitations.map(i => i.userId);
            if (!invitedIds.includes(userId)) {
                throw await this.errorHandlingService.getBusinessError(
                    BusinessErrorKeys.REQUEST_VALIDATION_ERROR,
                );
            }

            const isUserHaveStrongPermissions = (cupping.cuppingCreatorId === userId) || (relation.role == Role.OWNER);

            let response: Promise<IGetCuppingResponse>;
            switch (cupping.cuppingType) {
                case CuppingType.CREATED:
                    response = this.getCreatedCupping(userId, cupping, isUserHaveStrongPermissions);
                    break;
                case CuppingType.STARTED:
                    if (this.hasUserEndTesting(cupping, userId)) {
                        response = this.getLoaderCupping(userId, cupping, isUserHaveStrongPermissions);
                    } else {
                        response = this.getInProgressCupping(userId, cupping, isUserHaveStrongPermissions);
                    }
                    break;
                case CuppingType.ARCHIVED:
                    response = this.getEndedCupping(userId, cupping);
                    break;
                default:
                    // fallback
                    response = this.getCreatedCupping(userId, cupping, isUserHaveStrongPermissions);
                    break;
            }

            return response;
        } catch (error) {
            throw await this.errorHandlingService.getBusinessError(
                BusinessErrorKeys.REQUEST_VALIDATION_ERROR
            );
        }
    }

    async getCuppingStatus(
        userId: number,
        currentCompanyId: number,
        cuppingId: number,
    ): Promise<IGetCuppingStatusResponse> {
        try {
            const cupping = await this.prisma.cupping.findUnique({
                where: { id: cuppingId },
                include: { sampleTestings: true }
            });

            if (!cupping || cupping.companyId !== currentCompanyId) {
                throw await this.errorHandlingService.getBusinessError(
                    BusinessErrorKeys.REQUEST_VALIDATION_ERROR,
                );
            }

            return {
                status: this.mappingService.translateTypeToStatus(
                    cupping.cuppingType,
                    this.hasUserEndTesting(cupping, userId)
                )
            }
        } catch (error) {
            throw await this.errorHandlingService.getBusinessError(
                BusinessErrorKeys.REQUEST_VALIDATION_ERROR
            );
        }
    }

    async setCuppingStatus(
        userId: number,
        currentCompanyId: number,
        dto: SetCuppingStatusRequestDto,
    ): Promise<StatusResponseDto> {
        try {
            const { cuppingId, cuppingStatus } = dto;
            const cuppingType = this.mappingService.translateStatusToType(cuppingStatus);

            if (cuppingType == CuppingType.ARCHIVED) {
                await this.saveCuppingResults(cuppingId);
            }

            await this.prisma.cupping.update({
                where: { id: cuppingId },
                data: { cuppingType },
            });

            if (cuppingType == CuppingType.ARCHIVED) {
                await this.prisma.cupping.update({
                    where: { id: cuppingId },
                    data: { endDate: new Date() },
                });
            }

            return {
                status: StatusType.SUCCESS,
                description: await this.localizationStringsService.getCuppingText(
                    CuppingKeys.CUPPING_STATUS_UPDATED,
                    { cuppingId: cuppingId, cuppingStatus: cuppingType }
                )
            };
        } catch (error) {
            throw await this.errorHandlingService.getBusinessError(
                BusinessErrorKeys.REQUEST_VALIDATION_ERROR
            );
        }
    }

    async setCuppingTests(
        userId: number,
        currentCompanyId: number,
        dto: SetCuppingTestsRequestDto,
    ): Promise<StatusResponseDto> {
        const { tests } = dto;

        // Validate at least one test
        if (!tests || tests.length === 0) {
            throw await this.errorHandlingService.getBusinessError(
                BusinessErrorKeys.REQUEST_VALIDATION_ERROR,
            );
        }

        // Ensure cupping belongs to company
        const cuppingId = tests[0].cuppingId;
        const cupping = await this.prisma.cupping.findUnique({
            where: { id: cuppingId },
            select: { companyId: true, cuppingType: true, invitations: { select: { userId: true } } },
        });
        if (!cupping || cupping.companyId !== currentCompanyId) {
            throw await this.errorHandlingService.getBusinessError(
                BusinessErrorKeys.REQUEST_VALIDATION_ERROR,
            );
        }

        // Ensure user is invited
        const invitedIds = cupping.invitations.map(i => i.userId);
        if (!invitedIds.includes(userId)) {
            throw await this.errorHandlingService.getBusinessError(
                BusinessErrorKeys.REQUEST_VALIDATION_ERROR,
            );
        }

        // Ensure that cupping isnt archived or still not started
        if (cupping.cuppingType != CuppingType.STARTED) {
            throw await this.errorHandlingService.getBusinessError(
                BusinessErrorKeys.REQUEST_VALIDATION_ERROR,
            );
        }

        try {
            // Create all sampleTesting records in a single transaction
            const createdEntries = await this.prisma.$transaction(
                tests.map(test => {
                    const { coffeePackId, properties } = test;
                    return this.prisma.sampleTesting.create({
                        data: {
                            userId,
                            companyId: currentCompanyId,
                            cuppingId,
                            coffeePackId,
                            userSampleProperties: {
                                create: properties.map(p => ({
                                    propertyType: this.mappingService.translateTestToPropertyType(p.testPropertyType),
                                    intensity: p.intensity,
                                    quality: p.quality,
                                    comment: p.comment,
                                })),
                            },
                        },
                    });
                }),
            );

            return {
                status: StatusType.SUCCESS,
                description: await this.localizationStringsService.getCuppingText(
                    CuppingKeys.SAMPLE_TESTS_RECORDED,
                    { sampleTestsAmount: createdEntries.length }
                ),
            };
        } catch (error) {
            throw await this.errorHandlingService.getBusinessError(
                BusinessErrorKeys.REQUEST_VALIDATION_ERROR,
            );
        }
    }

    // MARK: - Private Methods

    private hasUserEndTesting(
        cupping: Cupping & { sampleTestings: { userId: number }[] },
        userId: number,
    ): boolean {
        return cupping.sampleTestings.some(t => t.userId === userId);
    }

    // Get cupping template when chief still doesnt start it
    private async getCreatedCupping(
        userId: number,
        cupping: Cupping & any,
        isUserHaveStrongPermissions: boolean
    ): Promise<IGetCuppingResponse> {
        return this.buildResponse(
            userId,
            cupping,
            CuppingStatus.planned,
            isUserHaveStrongPermissions,
            false
        );
    }

    // Get cupping data when chief start it
    private async getInProgressCupping(
        userId: number,
        cupping: Cupping & any,
        isUserHaveStrongPermissions: boolean,
    ): Promise<IGetCuppingResponse> {
        return this.buildResponse(
            userId,
            cupping,
            CuppingStatus.inProgress,
            isUserHaveStrongPermissions,
            true
        );
    }

    // Get loader after user pass all data and now status for him doneByCurrentUser
    private async getLoaderCupping(
        userId: number,
        cupping: Cupping & any,
        isUserHaveStrongPermissions: boolean
    ): Promise<IGetCuppingResponse> {
        return this.buildResponse(
            userId,
            cupping,
            CuppingStatus.doneByCurrentUser,
            isUserHaveStrongPermissions,
            false
        );
    }

    // Get info about cupping when it is over and archived so we can show results on front
    private async getEndedCupping(
        userId: number,
        cupping: Cupping & any,
    ): Promise<IGetCuppingResponse> {
        return this.buildResponse(
            userId,
            cupping,
            CuppingStatus.ended,
            false,
            true
        );
    }

    private buildResponse(
        userId: number,
        cupping: Cupping & any,
        status: CuppingStatus,
        isUserHaveStrongPermissions: boolean,
        includeSamples = true,
    ): IGetCuppingResponse {
        return {
            status,
            eventDate: cupping.eventDate?.toISOString(),
            endDate: cupping.endDate?.toISOString() ?? null,
            canUserStartCupiing: isUserHaveStrongPermissions,
            canUserEndCupiing: isUserHaveStrongPermissions,
            samples: includeSamples ? this.mappingService.mapCuppingSamples(cupping, userId) : [],
        };
    }
    
    private async saveCuppingResults(cuppingId: number) {
        try {
            // — STEP 0: Remove any old results for this cuppingId so we can re‐insert fresh ones
            const deletedCount = await this.prisma.cuppingSampleTestingResult.deleteMany({
                where: { cuppingId },
            });

            // — STEP 1: Load the cupping + all sampleTestings (including each user's properties)
            const cupping = await this.prisma.cupping.findUnique({
                where: { id: cuppingId },
                select: {
                    cuppingCreatorId: true,
                    sampleTestings: {
                        include: { userSampleProperties: true },
                    },
                },
            });

            if (!cupping) {
                throw await this.errorHandlingService.getBusinessError(
                    BusinessErrorKeys.REQUEST_VALIDATION_ERROR
                );
            }

            const allTestings = cupping.sampleTestings;

            if (allTestings.length === 0) {
                return;
            }

            const chiefUserId = cupping.cuppingCreatorId;

            // — STEP 2: Group all SampleTesting rows by coffeePackId
            const testsByPack = new Map<
                number,
                (SampleTesting & { userSampleProperties: SampleProperty[] })[]
            >();
            for (const testing of allTestings) {
                const packId = testing.coffeePackId;
                if (!testsByPack.has(packId)) {
                    testsByPack.set(packId, []);
                }
                testsByPack.get(packId)!.push(testing);
            }

            // — STEP 3: For each coffeePackId, compute averages & re‐insert result rows
            //    NOTE: we know there are exactly 5 PropertyType values, so propertyCount = 5
            const propertyCount = 5;

            for (const [coffeePackId, testsForThisPack] of testsByPack.entries()) {

                // 3a) Compute overall averageScore for this pack
                let sumOfTestersTotals = 0;
                for (const oneTest of testsForThisPack) {
                    let singleTesterTotal = 0;

                    for (const prop of oneTest.userSampleProperties) {
                        singleTesterTotal += prop.intensity + prop.quality;
                    }
                    sumOfTestersTotals += singleTesterTotal;
                }

                // Before: overallAverageScore = Math.round(sumOfTestersTotals / testsForThisPack.length)
                // Now: divide by number of properties (5) to get 0–10 scale, then round.
                const rawAveragePerTester = sumOfTestersTotals / testsForThisPack.length;
                const overallAverageScore = Math.round(rawAveragePerTester / propertyCount);

                // 3b) For each PropertyType, compute averages and chief’s own value
                type AggResult = {
                    propertyType: PropertyType;
                    averageIntensity: number;
                    averageQuality: number;
                    chiefIntensity: number;
                    chiefQuality: number;
                };

                const propertyResults: AggResult[] = [];
                const allPropertyTypes: PropertyType[] = [
                    PropertyType.AROMA,
                    PropertyType.ACIDITY,
                    PropertyType.SWEETNESS,
                    PropertyType.BODY,
                    PropertyType.AFTERTASTE,
                ];

                const chiefTesting = testsForThisPack.find((t) => t.userId === chiefUserId);

                for (const propType of allPropertyTypes) {

                    // Collect all SampleProperty entries (of this propertyType) across all testers
                    const matchingProps: SampleProperty[] = [];
                    for (const oneTest of testsForThisPack) {
                        for (const prop of oneTest.userSampleProperties) {
                            if (prop.propertyType === propType) {
                                matchingProps.push(prop);
                            }
                        }
                    }

                    let avgIntensity = 0;
                    let avgQuality = 0;
                    if (matchingProps.length > 0) {
                        const sumIntensity = matchingProps.reduce((acc, p) => acc + p.intensity, 0);
                        const sumQuality = matchingProps.reduce((acc, p) => acc + p.quality, 0);
                        avgIntensity = Math.round(sumIntensity / matchingProps.length);
                        avgQuality = Math.round(sumQuality / matchingProps.length);
                    }

                    let chiefIntensity = 0;
                    let chiefQuality = 0;
                    if (chiefTesting) {
                        const chiefProp = chiefTesting.userSampleProperties.find((p) => p.propertyType === propType);
                        if (chiefProp) {
                            chiefIntensity = chiefProp.intensity;
                            chiefQuality = chiefProp.quality;
                        }
                    }

                    propertyResults.push({
                        propertyType: propType,
                        averageIntensity: avgIntensity,
                        averageQuality: avgQuality,
                        chiefIntensity,
                        chiefQuality,
                    });
                }

                await this.prisma.cuppingSampleTestingResult.create({
                    data: {
                        cupping: { connect: { id: cuppingId } },
                        coffeePack: { connect: { id: coffeePackId } },
                        averageScore: overallAverageScore,
                        cuppingSampleTestingPropertyResult: {
                            create: propertyResults.map((r) => ({
                                propertyType: r.propertyType,
                                averageIntensivityScore: r.averageIntensity,
                                averageQualityScore: r.averageQuality,
                                averageChiefIntensivityScore: r.chiefIntensity,
                                averageChiefQualityScore: r.chiefQuality,
                            })),
                        },
                    },
                });
            }
        } catch (error) {
            throw await this.errorHandlingService.getBusinessError(
                BusinessErrorKeys.REQUEST_VALIDATION_ERROR
            );
        }
    }
}