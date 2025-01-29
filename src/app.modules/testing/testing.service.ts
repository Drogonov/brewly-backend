import { Injectable } from '@nestjs/common';
import { GetCuppingSamplesRequestDto, IGetCuppingSamplesResponse, SaveCuppingTestsRequestDto } from './dto';
import { ISuccessIdResponse } from '../samples/dto';

@Injectable()
export class TestingService {

    async getCuppingSamples(dto: GetCuppingSamplesRequestDto): Promise<IGetCuppingSamplesResponse> {
        return {
            cuppingId: 666,
            sampleTestings: []
        };
    }

    async saveCuppingTestsResult(dto: SaveCuppingTestsRequestDto): Promise<ISuccessIdResponse> {
        return {
            id: 666
        };
    }
}