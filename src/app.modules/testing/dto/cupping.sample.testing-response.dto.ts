import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// MARK: - Project implementation

export interface ISampleTestingResponse {
    sampleTestingId: number;
    sampleItemId: number;
    sampleName: string;
    propertyNames: string[];
}

// MARK: - Swagger class

export class SampleTestingResponseDto implements ISampleTestingResponse {

    @ApiProperty({ description: 'Id of the sample testing', example: 666 })
    sampleTestingId: number;

    @ApiProperty({ description: 'Id of the sample item from warehouse', example: 666 })
    sampleItemId: number;

    @ApiProperty({ description: 'Sample name. Can be covered with placeholder to hide origin name', example: "Sample 1" })
    sampleName: string;

    @ApiProperty({ description: 'Names of the Properties to test', example: ["Intensity", "Acidity"] })
    propertyNames: string[];
}
