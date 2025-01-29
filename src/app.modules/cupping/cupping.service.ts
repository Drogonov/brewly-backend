import { Injectable } from '@nestjs/common';
import { CreateCuppingRequestDto, ISuccessIdResponse } from './dto';
import { GetCuppingResultsRequestDto } from './dto/get.cupping.results-request.dto';
import { IGetCuppingResultsResponse } from './dto/get.cupping.results-response.dto';

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
}