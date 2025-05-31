import { Injectable } from '@nestjs/common';
import { CreateCuppingRequestDto, CuppingStatus, GetCuppingsListResponseDto, IGetCuppingSampleResponse, IGetCuppingSampleTest, IGetCuppingsListResponse, IGetCuppingStatusResponse, IStatusResponse, ISuccessIdResponse, SetCuppingStatusRequestDto, SetCuppingTestRequestDto, SetCuppingTestsRequestDto, StatusResponseDto, StatusType, TestType } from './dto';
import { ErrorHandlingService } from 'src/app.common/error-handling/error-handling.service';
import { ErrorSubCode } from 'src/app.common/error-handling/exceptions';
import { PrismaService } from 'src/app.common/services/prisma/prisma.service';
import { Cupping, CuppingType, PropertyType, Role, SampleProperty, SampleTesting } from '@prisma/client';
import { MappingService } from 'src/app.common/services/mapping.service';
import { IGetCuppingResponse } from './dto/get-cupping.response.dto';
import { LocalizationStringsService } from 'src/app.common/localization/localization-strings.service';
import { CuppingKeys } from 'src/app.common/localization/generated';

@Injectable()
export class CuppingService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly errorHandlingService: ErrorHandlingService,
        private localizationStringsService: LocalizationStringsService,
        private mappingService: MappingService,
    ) { }

    async createCupping(
        userId: number,
        currentCompanyId: number,
        dto: CreateCuppingRequestDto
    ): Promise<IStatusResponse> {
        console.log(dto);
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
                ErrorSubCode.REQUEST_VALIDATION_ERROR
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
                ErrorSubCode.REQUEST_VALIDATION_ERROR
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
                    ErrorSubCode.REQUEST_VALIDATION_ERROR,
                );
            }
            const invitedIds = cupping.invitations.map(i => i.userId);
            if (!invitedIds.includes(userId)) {
                throw await this.errorHandlingService.getBusinessError(
                    ErrorSubCode.REQUEST_VALIDATION_ERROR,
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
                        console.log("DEBUG: getLoaderCupping");
                        response = this.getLoaderCupping(userId, cupping, isUserHaveStrongPermissions);
                    } else {
                        console.log("DEBUG: getInProgressCupping");
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
            
            console.log(`Type: ${cupping.cuppingType}`);
            console.log("DEBUG: Response");
            console.log(response);
            return response;
        } catch (error) {
            throw await this.errorHandlingService.getBusinessError(
                ErrorSubCode.REQUEST_VALIDATION_ERROR
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
                    ErrorSubCode.REQUEST_VALIDATION_ERROR,
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
                ErrorSubCode.REQUEST_VALIDATION_ERROR
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

            console.log("DEBUG: start changing status");
            if (cuppingType == CuppingType.ARCHIVED) {
                console.log("DEBUG: start saving results");
                await this.saveCuppingResults(cuppingId);
                console.log("DEBUG: results saved");
            }

            await this.prisma.cupping.update({
                where: { id: cuppingId },
                data: { cuppingType },
            });

            console.log(`DEBUG: status changed to ${cuppingType}`);

            return {
                status: StatusType.SUCCESS,
                description: await this.localizationStringsService.getCuppingText(
                    CuppingKeys.CUPPING_STATUS_UPDATED,
                    { cuppingId: cuppingId, cuppingStatus: cuppingType }
                )
            };
        } catch (error) {
            throw await this.errorHandlingService.getBusinessError(
                ErrorSubCode.REQUEST_VALIDATION_ERROR
            );
        }
    }

    async setCuppingTests(
        userId: number,
        currentCompanyId: number,
        dto: SetCuppingTestsRequestDto,
    ): Promise<StatusResponseDto> {
        const { tests } = dto;

        console.log(dto);

        // Validate at least one test
        if (!tests || tests.length === 0) {
            throw await this.errorHandlingService.getBusinessError(
                ErrorSubCode.REQUEST_VALIDATION_ERROR,
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
                ErrorSubCode.REQUEST_VALIDATION_ERROR,
            );
        }

        // Ensure user is invited
        const invitedIds = cupping.invitations.map(i => i.userId);
        if (!invitedIds.includes(userId)) {
            throw await this.errorHandlingService.getBusinessError(
                ErrorSubCode.REQUEST_VALIDATION_ERROR,
            );
        }

        // Ensure that cupping isnt archived or still not started
        if (cupping.cuppingType != CuppingType.STARTED) {
            throw await this.errorHandlingService.getBusinessError(
                ErrorSubCode.REQUEST_VALIDATION_ERROR,
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
                ErrorSubCode.REQUEST_VALIDATION_ERROR,
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
        console.log(`DEBUG: ${status}`);
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
            // 1) Load the cupping + all sampleTestings (including each user's properties)
            const cupping = await this.prisma.cupping.findUnique({
                where: { id: cuppingId },
                select: {
                    cuppingCreatorId: true,
                    sampleTestings: {
                        include: {
                            userSampleProperties: true, // each SampleProperty has propertyType, intensity, quality, etc.
                        },
                    },
                },
            });

            console.log("DEBUG: saveCuppingResults");

            if (!cupping) {
                // If the cupping doesn’t exist, bail out
                throw await this.errorHandlingService.getBusinessError(
                    ErrorSubCode.REQUEST_VALIDATION_ERROR
                );
            }

            const allTestings = cupping.sampleTestings;
            if (allTestings.length === 0) {
                // No one tested anything—nothing to aggregate
                return;
            }

            const chiefUserId = cupping.cuppingCreatorId;

            // 2) Group all SampleTesting rows by coffeePackId
            const testsByPack = new Map<number, (SampleTesting & { userSampleProperties: SampleProperty[] })[]>();
            for (const testing of allTestings) {
                const packId = testing.coffeePackId;
                if (!testsByPack.has(packId)) {
                    testsByPack.set(packId, []);
                }
                testsByPack.get(packId)!.push(testing);
            }

            // 3) For each coffeePackId, compute averages & create the corresponding result rows
            for (const [coffeePackId, testsForThisPack] of testsByPack.entries()) {
                // 3a) Compute overall averageScore for this pack:
                //     - For each SampleTesting, sum (intensity + quality) over all its SampleProperty entries
                //     - Then average those sums across all testers
                let sumOfTestersTotals = 0;
                for (const oneTest of testsForThisPack) {
                    let singleTesterTotal = 0;
                    for (const prop of oneTest.userSampleProperties) {
                        singleTesterTotal += prop.intensity + prop.quality;
                    }
                    sumOfTestersTotals += singleTesterTotal;
                }
                const overallAverageScore = Math.round(
                    sumOfTestersTotals / testsForThisPack.length
                );

                // 3b) For each PropertyType, compute:
                //     (i)   average intensity across all testers
                //     (ii)  average quality across all testers
                //     (iii) chief’s intensity/quality if the chief tested this pack
                type AggResult = {
                    propertyType: PropertyType;
                    averageIntensity: number;
                    averageQuality: number;
                    chiefIntensity: number;
                    chiefQuality: number;
                };

                const propertyResults: AggResult[] = [];

                // We know PropertyType is an enum; build an array of all enums
                const allPropertyTypes: PropertyType[] = [
                    PropertyType.AROMA,
                    PropertyType.ACIDITY,
                    PropertyType.SWEETNESS,
                    PropertyType.BODY,
                    PropertyType.AFTERTASTE,
                ];

                // Pre‐find if a “chief”‐testing exists for this coffeePack
                const chiefTesting = testsForThisPack.find(
                    (t) => t.userId === chiefUserId
                );

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
                        const sumIntensity = matchingProps.reduce(
                            (acc, p) => acc + p.intensity,
                            0
                        );
                        const sumQuality = matchingProps.reduce(
                            (acc, p) => acc + p.quality,
                            0
                        );
                        avgIntensity = Math.round(sumIntensity / matchingProps.length);
                        avgQuality = Math.round(sumQuality / matchingProps.length);
                    }

                    // Chief’s own score for this property (if any)
                    let chiefIntensity = 0;
                    let chiefQuality = 0;
                    if (chiefTesting) {
                        const chiefProp = chiefTesting.userSampleProperties.find(
                            (p) => p.propertyType === propType
                        );
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

                // 3c) Finally, write one CuppingSampleTestingResult with nested property‐rows
                await this.prisma.cuppingSampleTestingResult.create({
                    data: {
                        cupping: { connect: { id: cuppingId } },
                        coffeePack: { connect: { id: coffeePackId } },
                        averageScore: overallAverageScore,
                        // Prisma schema’s field for nested creation is exactly "cuppingSampleTestingPropertyResult"
                        cuppingSampleTestingPropertyResult: {
                            create: propertyResults.map((r) => ({
                                propertyType: r.propertyType,
                                averageIntensivityScore: r.averageIntensity,
                                averageQualityScore: r.averageQuality,
                                averageChiefIntensivityScore: r.chiefIntensity,
                                averageChiefQualityScore: r.chiefQuality,
                                // Note: Because the child model’s relation field is called
                                //       “cuppingSampleTestingResult” (back to this parent),
                                //       Prisma will auto‐fill cuppingSampleTestingResultId.
                            })),
                        },
                    },
                });
            }
        } catch (error) {
            // Bubble up a business error if anything goes wrong
            throw await this.errorHandlingService.getBusinessError(
                ErrorSubCode.REQUEST_VALIDATION_ERROR
            );
        }
    }
}