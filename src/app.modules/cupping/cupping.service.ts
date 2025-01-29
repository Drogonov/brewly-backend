import { Injectable } from '@nestjs/common';
import { CreateCuppingRequestDto, ISuccessIdResponse } from './dto';

@Injectable()
export class CuppingService {
    async createCupping(dto: CreateCuppingRequestDto): Promise<ISuccessIdResponse> {
        return {
            id: 666
        }
    }
}