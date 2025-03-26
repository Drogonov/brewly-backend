import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ISampleTypeInfoResponse } from './nested/sample-type-info.response.dto';

// MARK: - Project implementation

export interface IGetSampleTypesResponse {
    sampleTypesInfo: ISampleTypeInfoResponse[];
}

// MARK: - Swagger class

export class GetSampleTypesResponseDto implements IGetSampleTypesResponse {
    @ApiProperty({ description: "Availiable sample types" })
    sampleTypesInfo: ISampleTypeInfoResponse[];
}