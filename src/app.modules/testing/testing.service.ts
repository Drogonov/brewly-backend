import { Injectable } from '@nestjs/common';
import { GetCuppingSamplesRequestDto, IGetCuppingSamplesResponse } from './dto';

@Injectable()
export class TestingService {

    async getCuppingSamples(dto: GetCuppingSamplesRequestDto): Promise<IGetCuppingSamplesResponse> {
        return {
            cuppingId: 666,
            sampleTestings: []
        };
    }
}