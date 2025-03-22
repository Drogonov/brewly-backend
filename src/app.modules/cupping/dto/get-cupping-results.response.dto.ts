import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// MARK: - Project implementation

export interface IGetCuppingResultsResponse {
    cuppingId: number;
    cuppingTimeInSeconds: number;
    resultForSamples: ICuppingSampleResult[];
}

export interface ICuppingSampleResult {
    averageScore: number;
    averageSampleTestingId: number;
    // some other sample info including deep info for new screen
}

// MARK: - Swagger class

export class GetCuppingResultsResponseDto implements IGetCuppingResultsResponse {

    @ApiProperty({ description: 'Id of the sample testing', example: 666 })
    cuppingId: number;

    @ApiProperty({ description: 'Id of the sample item from warehouse', example: 666 })
    cuppingTimeInSeconds: number;

    @ApiProperty({ description: 'Sample name. Can be covered with placeholder to hide origin name', example: "Sample 1" })
    resultForSamples: ICuppingSampleResult[];
}

export class CuppingSampleResultDto implements ICuppingSampleResult {

    @ApiProperty({ description: 'Id of the sample testing', example: 666 })
    averageScore: number;

    @ApiProperty({ description: 'Id of the sample item from warehouse', example: 666 })
    averageSampleTestingId: number;
}