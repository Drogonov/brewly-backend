import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ICoffeePackInfoResponse } from './nested/coffee-pack-info.response.dto';
import { ISampleTypeInfoResponse } from './nested/sample-type-info.response.dto';

// MARK: - Project implementation

export interface IGetSampleInfoResponse {
    sampleTypeInfo: ISampleTypeInfoResponse;
    coffeePacksInfo: ICoffeePackInfoResponse[];
}

// MARK: - Swagger class

export class GetSampleInfoResponseDto implements IGetSampleInfoResponse {
    @ApiProperty({ description: 'Type describing sample' })
    sampleTypeInfo: ISampleTypeInfoResponse;

    @ApiProperty({ example: 'Current coffee packs of that sample type' })
    coffeePacksInfo: ICoffeePackInfoResponse[];
}