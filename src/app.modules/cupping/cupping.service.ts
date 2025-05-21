import { Injectable } from '@nestjs/common';
import { CreateCuppingRequestDto, CuppingStatus, IGetCuppingsListResponse, ISuccessIdResponse } from './dto';
import { GetCuppingResultsRequestDto } from './dto/get-cupping-results.request.dto';
import { IGetCuppingResultsResponse } from './dto/get-cupping-results.response.dto';
import { ErrorHandlingService } from 'src/app.common/error-handling/error-handling.service';
import { ErrorSubCode } from 'src/app.common/error-handling/exceptions';
import { PrismaService } from 'src/app.common/services/prisma/prisma.service';

@Injectable()
export class CuppingService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly errorHandlingService: ErrorHandlingService,
    ) { }

    async createCupping(
        userId: number,
        currentCompanyId: number,
        dto: CreateCuppingRequestDto
    ): Promise<ISuccessIdResponse> {
        const { samples, settings, chosenUserIds } = dto;

        // if “inviteAllTeammates” is true, override chosenUserIds
        const invitedUserIds = settings.inviteAllTeammates
            ? (
                await this.prisma.userToCompanyRelation.findMany({
                    where: { companyId: currentCompanyId },
                    select: { userId: true }
                })
            )
                .map(r => r.userId)
                .filter(id => id !== userId)
            : chosenUserIds;

        try {
            const created = await this.prisma.cupping.create({
                data: {
                    cuppingCreator: { connect: { id: userId } },
                    cuppingName: settings.cuppingName,
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
            });

            await this.prisma.cuppingInvitation.createMany({
                data: invitedUserIds.map(userId => ({
                    cuppingId: created.id,
                    userId,
                })),
            });

            return { id: created.id };
        } catch (error) {
            // wrap any error in your business-error system
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

    async getCuppingsList(userId: number, currentCompanyId: number): Promise<IGetCuppingsListResponse> {
        return {
            cuppings: [
                {
                    id: 1,
                    title: 'Cupping #3',
                    dateOfTheEvent: '2025-03-01T00:00:00Z',
                    status: CuppingStatus.inProgress
                },
                {
                    id: 2,
                    title: 'Cupping #2',
                    dateOfTheEvent: '2025-02-01T00:00:00Z',
                    status: CuppingStatus.planned
                },
                {
                    id: 3,
                    title: 'Cupping #1',
                    dateOfTheEvent: '2025-01-01T00:00:00Z',
                    status: CuppingStatus.ended
                }
            ]
        }
    }
}