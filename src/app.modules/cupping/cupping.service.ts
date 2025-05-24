import { Injectable } from '@nestjs/common';
import { CreateCuppingRequestDto, CuppingStatus, GetCuppingsListResponseDto, IGetCuppingSampleResponse, IGetCuppingSampleTest, IGetCuppingsListResponse, IStatusResponse, ISuccessIdResponse, StatusType, TestType } from './dto';
import { GetCuppingResultsRequestDto } from './dto/get-cupping-results.request.dto';
import { IGetCuppingResultsResponse } from './dto/get-cupping-results.response.dto';
import { ErrorHandlingService } from 'src/app.common/error-handling/error-handling.service';
import { ErrorSubCode } from 'src/app.common/error-handling/exceptions';
import { PrismaService } from 'src/app.common/services/prisma/prisma.service';
import { Cupping, CuppingType } from '@prisma/client';
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
            console.log(error);
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
            console.log(error);
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
        // 1) Fetch the cupping, its creator, settings, invitations and linked packs
        const cupping = await this.prisma.cupping.findUnique({
            where: { id: cuppingId },
            include: {
                cuppingCreator: true,
                settings: true,
                invitations: { select: { userId: true } },    // renamed to match schema
                coffeePacks: {
                    include: { sampleType: true },               // pull in sampleType data
                },
            },
        });

        // 2) Validate existence and company
        if (!cupping || cupping.companyId !== currentCompanyId) {
            throw await this.errorHandlingService.getBusinessError(
                ErrorSubCode.REQUEST_VALIDATION_ERROR,
            );
        }

        // 3) Validate invitation
        const invitedIds = cupping.invitations.map(inv => inv.userId);
        if (!invitedIds.includes(userId)) {
            throw await this.errorHandlingService.getBusinessError(
                ErrorSubCode.REQUEST_VALIDATION_ERROR,
            );
        }

        // 4) Auto-start if still CREATED and requester is creator
        if (
            cupping.cuppingType === CuppingType.CREATED &&
            cupping.cuppingCreatorId === userId
        ) {
            cupping.eventDate = new Date();
            cupping.cuppingType = CuppingType.STARTED;
            await this.prisma.cupping.update({
                where: { id: cuppingId },
                data: {
                    cuppingType: CuppingType.STARTED,
                    eventDate: cupping.eventDate,
                },
            });
        }

        // 5) Translate CuppingType → CuppingStatus
        const status: CuppingStatus = (() => {
            switch (cupping.cuppingType) {
                case CuppingType.CREATED:
                    return CuppingStatus.planned;
                case CuppingType.STARTED:
                    return CuppingStatus.inProgress;
                case CuppingType.ARCHIVED:
                    return CuppingStatus.ended;
            }
        })();

        // 6) Compute who can start/end
        const canUserStartCupping =
            status === CuppingStatus.planned && cupping.cuppingCreatorId === userId;
        const canUserEndCupping =
            status === CuppingStatus.inProgress &&
            cupping.cuppingCreatorId === userId;

        // 7) Build samples array
        const samples: IGetCuppingSampleResponse[] = cupping.coffeePacks.map(
            pack => {
                const hiddenSampleName = cupping.settings.openSampleNameCupping
                    ? undefined
                    : pack.sampleType.sampleName;

                const test: IGetCuppingSampleTest = {
                    type: TestType.aroma,
                    // other fields left undefined for UI to fill in sequence
                };

                return {
                    sampleTypeId: pack.sampleTypeId,
                    hiddenSampleName,
                    companyName: pack.sampleType.originCompanyName,
                    sampleName: pack.sampleType.sampleName,
                    beanOrigin: null,            // hook in your option-list here if needed
                    procecingMethod: null,       // ditto
                    roastType: pack.sampleType.roastType,
                    grindType: pack.sampleType.grindType,
                    packId: pack.id,
                    roastDate: pack.roastDate.toISOString(),
                    openDate: pack.openDate?.toISOString(),
                    weight: pack.weight,
                    barCode: pack.barCode,
                    test,
                };
            },
        );

        return {
            status,
            eventDate: cupping.eventDate?.toISOString(),
            endDate: null,                  // fill in when you implement “end” logic
            canUserStartCupiing: canUserStartCupping,
            canUserEndCupiing: canUserEndCupping,
            samples,
        };
    }
}