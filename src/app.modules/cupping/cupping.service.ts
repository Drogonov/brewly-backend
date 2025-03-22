import { Injectable } from '@nestjs/common';
import { CreateCuppingRequestDto, CuppingStatus, IGetCuppingsListResponse, ISuccessIdResponse } from './dto';
import { GetCuppingResultsRequestDto } from './dto/get-cupping-results.request.dto';
import { IGetCuppingResultsResponse } from './dto/get-cupping-results.response.dto';

@Injectable()
export class CuppingService {
    async createCupping(dto: CreateCuppingRequestDto): Promise<ISuccessIdResponse> {
        return {
            id: 666
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