import { Injectable } from '@nestjs/common';
import { CreateCuppingRequestDto, CuppingStatus, GetCuppingsListResponseDto, IGetCuppingSampleResponse, IGetCuppingSampleTest, IGetCuppingsListResponse, IGetCuppingStatusResponse, IStatusResponse, ISuccessIdResponse, SetCuppingStatusRequestDto, SetCuppingTestRequestDto, SetCuppingTestsRequestDto, StatusResponseDto, StatusType, TestType } from './dto';
import { GetCuppingResultsRequestDto } from './dto/get-cupping-results.request.dto';
import { IGetCuppingResultsResponse } from './dto/get-cupping-results.response.dto';
import { ErrorHandlingService } from 'src/app.common/error-handling/error-handling.service';
import { ErrorSubCode } from 'src/app.common/error-handling/exceptions';
import { PrismaService } from 'src/app.common/services/prisma/prisma.service';
import { Cupping, CuppingType, Role } from '@prisma/client';
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
                    sampleTestings: { select: { userId: true } },
                    cuppingHiddenPackNames: true
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

            switch (cupping.cuppingType) {
                case CuppingType.CREATED:
                    return this.getCreatedCupping(cupping, isUserHaveStrongPermissions);
                case CuppingType.STARTED:
                    if (this.hasUserEndTesting(cupping, userId)) {
                        return this.getLoaderCupping(cupping, isUserHaveStrongPermissions);
                    } else {
                        return this.getInProgressCupping(cupping, isUserHaveStrongPermissions);
                    }
                case CuppingType.ARCHIVED:
                    return this.getEndedCupping(cupping);
                default:
                    // fallback
                    return this.getCreatedCupping(cupping, isUserHaveStrongPermissions);
            }
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

            await this.prisma.cupping.update({
                where: { id: cuppingId },
                data: { cuppingType },
            });

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
        cupping: Cupping & any,
        isUserHaveStrongPermissions: boolean
    ): Promise<IGetCuppingResponse> {
        return this.buildResponse(
            cupping,
            CuppingStatus.planned,
            isUserHaveStrongPermissions,
            false
        );
    }

    // Get cupping data when chief start it
    private async getInProgressCupping(
        cupping: Cupping & any,
        isUserHaveStrongPermissions: boolean,
    ): Promise<IGetCuppingResponse> {
        return this.buildResponse(
            cupping,
            CuppingStatus.inProgress,
            isUserHaveStrongPermissions,
            true
        );
    }

    // Get loader after user pass all data and now status for him doneByCurrentUser
    private async getLoaderCupping(
        cupping: Cupping & any,
        isUserHaveStrongPermissions: boolean
    ): Promise<IGetCuppingResponse> {
        return this.buildResponse(
            cupping,
            CuppingStatus.doneByCurrentUser,
            isUserHaveStrongPermissions,
            false
        );
    }

    // Get info about cupping when it is over and archived so we can show results on front
    private async getEndedCupping(
        cupping: Cupping & any,
    ): Promise<IGetCuppingResponse> {
        return this.buildResponse(
            cupping,
            CuppingStatus.ended,
            false,
            true
        );
    }

    private buildResponse(
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
            samples: includeSamples ? this.mapSamples(cupping) : undefined,
        };
    }

    private mapSamples(
        cupping: Cupping & {
            settings: any;
            coffeePacks: any[];
            cuppingHiddenPackNames: { coffeePackId: number; coffeePackName: string }[]
        },
    ): IGetCuppingSampleResponse[] {
        const hiddenNameMap = new Map<number, string>(
            cupping.cuppingHiddenPackNames.map(h => [h.coffeePackId, h.coffeePackName])
        );

        return cupping.coffeePacks.map(pack => ({
            sampleTypeId: pack.sampleTypeId,
            hiddenSampleName: hiddenNameMap.get(pack.id) ?? null,
            companyName: pack.sampleType.originCompanyName,
            sampleName: pack.sampleType.sampleName,
            beanOrigin: null,
            procecingMethod: null,
            roastType: pack.sampleType.roastType,
            grindType: pack.sampleType.grindType,
            packId: pack.id,
            roastDate: pack.roastDate.toISOString(),
            openDate: pack.openDate?.toISOString(),
            weight: pack.weight,
            barCode: pack.barCode,
            test: { type: TestType.aroma } as IGetCuppingSampleTest,
        }));
    }
}