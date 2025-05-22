import { Injectable } from '@nestjs/common';
import { CreateCuppingRequestDto, CuppingStatus, GetCuppingsListResponseDto, IGetCuppingsListResponse, IStatusResponse, ISuccessIdResponse, StatusType } from './dto';
import { GetCuppingResultsRequestDto } from './dto/get-cupping-results.request.dto';
import { IGetCuppingResultsResponse } from './dto/get-cupping-results.response.dto';
import { ErrorHandlingService } from 'src/app.common/error-handling/error-handling.service';
import { ErrorSubCode } from 'src/app.common/error-handling/exceptions';
import { PrismaService } from 'src/app.common/services/prisma/prisma.service';
import { Cupping, CuppingType } from '@prisma/client';
import { MappingService } from 'src/app.common/services/mapping.service';

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
        chosenUserIds.push(userId);

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

        console.log(invitedUserIds);
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

    async getCuppingResult(dto: GetCuppingResultsRequestDto): Promise<IGetCuppingResultsResponse> {
        return {
            cuppingId: 0,
            cuppingTimeInSeconds: 1,
            resultForSamples: [],
        };
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
}