import { Injectable } from '@nestjs/common';
import { CreateCuppingRequestDto, CuppingStatus, GetCuppingsListResponseDto, IGetCuppingSampleResponse, IGetCuppingSampleTest, IGetCuppingsListResponse, IStatusResponse, ISuccessIdResponse, SetCuppingTestRequestDto, SetCuppingTestsRequestDto, SetCuppingTypeRequestDto, StatusResponseDto, StatusType, TestType } from './dto';
import { GetCuppingResultsRequestDto } from './dto/get-cupping-results.request.dto';
import { IGetCuppingResultsResponse } from './dto/get-cupping-results.response.dto';
import { ErrorHandlingService } from 'src/app.common/error-handling/error-handling.service';
import { ErrorSubCode } from 'src/app.common/error-handling/exceptions';
import { PrismaService } from 'src/app.common/services/prisma/prisma.service';
import { Cupping, CuppingType, Role } from '@prisma/client';
import { MappingService } from 'src/app.common/services/mapping.service';
import { IGetCuppingResponse } from './dto/get-cupping.response.dto';

@Injectable()
export class CuppingService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly errorHandlingService: ErrorHandlingService,
        private mappingService: MappingService,
    ) { }

    async createCupping(
        userId: number,
        currentCompanyId: number,
        dto: CreateCuppingRequestDto
    ): Promise<IStatusResponse> {
        console.log(dto);
        const { samples, settings, chosenUserIds } = dto;

        // Add current user to the array
        if (chosenUserIds) {
            chosenUserIds.push(userId);
        }

        // Determine invited users
        const invitedUserIds = settings.inviteAllTeammates
            ? (
                await this.prisma.userToCompanyRelation.findMany({
                    where: { companyId: currentCompanyId },
                    select: { userId: true },
                })
            )
                .map(r => r.userId)
            // .filter(id => id !== userId)
            : chosenUserIds;

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

            // 2) Bulk create invitations, skip duplicates
            await this.prisma.cuppingInvitation.createMany({
                data: invitedUserIds.map(uId => ({ cuppingId: created.id, userId: uId })),
                skipDuplicates: true,
            })

            console.log(created.id);

            return {
                status: StatusType.SUCCESS,
                description: `Cupping with id ${created.id} created`
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
                include: { settings: true },
                orderBy: { createdAt: 'desc' },
            });

            return {
                cuppings: cuppings.map(c => this.mappingService.mapCupping(c as Cupping & { settings: any }))
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
                    return this.getCreatedCupping(cupping, userId);
                case CuppingType.STARTED:
                    if (this.hasUserEndTesting(cupping, userId)) {
                        return this.getLoaderCupping(cupping, userId);
                    } else {
                        return this.getInProgressCupping(cupping, userId);
                    }
                case CuppingType.ARCHIVED:
                    return this.getEndedCupping(cupping, userId);
                default:
                    // fallback
                    return this.getCreatedCupping(cupping, userId);
            }
        } catch (error) {
            throw await this.errorHandlingService.getBusinessError(
                ErrorSubCode.REQUEST_VALIDATION_ERROR
            );
        }
    }

    async getCuppingType(
        userId: number,
        currentCompanyId: number,
        cuppingId: number,
    ): Promise<string> {
        try {
            const cupping = await this.prisma.cupping.findUnique({
                where: { id: cuppingId }
            });

            if (!cupping || cupping.companyId !== currentCompanyId) {
                throw await this.errorHandlingService.getBusinessError(
                    ErrorSubCode.REQUEST_VALIDATION_ERROR,
                );
            }
            return cupping.cuppingType;

        } catch (error) {
            throw await this.errorHandlingService.getBusinessError(
                ErrorSubCode.REQUEST_VALIDATION_ERROR
            );
        }
    }

    async setCuppingStatus(
        userId: number,
        currentCompanyId: number,
        dto: SetCuppingTypeRequestDto,
    ): Promise<StatusResponseDto> {
        try {
            const { cuppingId, cuppingType } = dto;
            await this.prisma.cupping.update({
                where: { id: cuppingId },
                data: { cuppingType },
            });

            return {
                status: StatusType.SUCCESS,
                description: `Cupping ${cuppingId} set to ${cuppingType}`
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
                    const { coffeePackId, userTestingTimeInSeconds, properties } = test;
                    return this.prisma.sampleTesting.create({
                        data: {
                            userId,
                            companyId: currentCompanyId,
                            cuppingId,
                            coffeePackId,
                            userTestingTimeInSeconds,
                            userSampleProperties: {
                                create: properties.map(p => ({
                                    propertyTypeId: p.propertyTypeId,
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
                description: `${createdEntries.length} sample tests recorded`,
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
        userId: number,
    ): Promise<IGetCuppingResponse> {
        const status = CuppingStatus.planned;
        const canStart = cupping.cuppingCreatorId === userId;
        return this.buildBaseResponse(cupping, status, canStart, false);
    }

    // Get cupping data when chief start it
    private async getInProgressCupping(
        cupping: Cupping & any,
        userId: number,
    ): Promise<IGetCuppingResponse> {
        const status = CuppingStatus.inProgress;
        const canEnd = cupping.cuppingCreatorId === userId;
        return this.buildBaseResponse(cupping, status, false, canEnd);
    }

    // Get loader after user pass all data and now status for him doneByCurrentUser
    private async getLoaderCupping(
        cupping: Cupping & any,
        userId: number,
    ): Promise<IGetCuppingResponse> {
        const canStart = cupping.cuppingCreatorId === userId;
        const status = CuppingStatus.doneByCurrentUser;

        return {
            status,
            eventDate: cupping.eventDate?.toISOString(),
            endDate: null,
            canUserStartCupiing: canStart,
            canUserEndCupiing: canStart,
        };
    }

    // Get info about cupping when it is over and archived so we can show results on front
    private async getEndedCupping(
        cupping: Cupping & any,
        userId: number,
    ): Promise<IGetCuppingResponse> {
        const status = CuppingStatus.ended;
        return this.buildBaseResponse(cupping, status, false, false);
    }

    private buildBaseResponse(
        cupping: Cupping & any,
        status: CuppingStatus,
        canStart: boolean,
        canEnd: boolean,
    ): IGetCuppingResponse {
        const samples: IGetCuppingSampleResponse[] = cupping.coffeePacks.map(pack => {
            const hidden = cupping.settings.openSampleNameCupping ? undefined : pack.sampleType.sampleName;
            const test: IGetCuppingSampleTest = { type: TestType.aroma };
            return {
                sampleTypeId: pack.sampleTypeId,
                hiddenSampleName: hidden,
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
                test,
            };
        });

        return {
            status,
            eventDate: cupping.eventDate?.toISOString(),
            endDate: null,
            canUserStartCupiing: canStart,
            canUserEndCupiing: canEnd,
            samples,
        };
    }
}