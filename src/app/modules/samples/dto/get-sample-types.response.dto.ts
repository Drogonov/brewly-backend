import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ISampleTypeInfoResponse, SampleTypeInfoResponseDto } from './nested/sample-type-info.response.dto';
import { Type } from 'class-transformer';

// MARK: - Project implementation

export interface IGetSampleTypesResponse {
    sampleTypesInfo: ISampleTypeInfoResponse[];
}

// MARK: - Swagger class

export class GetSampleTypesResponseDto implements IGetSampleTypesResponse {
    @ApiProperty({
        description: 'Available sample types',
        type: () => SampleTypeInfoResponseDto,
        isArray: true,
    })
    @Type(() => SampleTypeInfoResponseDto)
    sampleTypesInfo: ISampleTypeInfoResponse[];
}