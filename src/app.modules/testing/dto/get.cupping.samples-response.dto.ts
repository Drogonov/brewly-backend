import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ISampleTestingResponse } from './cupping.sample.testing-response.dto';

// MARK: - Project implementation

export interface IGetCuppingSamplesResponse {
    cuppingId: number;
    sampleTestings: ISampleTestingResponse[];
}

// MARK: - Swagger class

export class GetCuppingSamplesResponseDto implements IGetCuppingSamplesResponse {
    @ApiProperty({ description: 'Id of the cupping', example: 666 })
    cuppingId: number;

    @ApiProperty({ description: 'Array of the sample testing elements'})
    sampleTestings: ISampleTestingResponse[];
}

