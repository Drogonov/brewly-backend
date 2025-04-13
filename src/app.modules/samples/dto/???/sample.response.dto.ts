import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import internal from 'stream';

// MARK: - Project implementation

export interface ISampleResponse {
    sampleTypeId: number;
    compnayName: string;
    sampleName: string;
    roastType: string;
    coffeeType: string;
    sampleItemId: number;
    roastDate: string;
    openDate: string;
    weight: number;
    barCode: string;
}

// MARK: - Swagger class

export class SampleResponseDto implements ISampleResponse {

    @ApiProperty({ example: '666' })
    sampleTypeId: number;

    @ApiProperty({ example: 'Tasty Coffee' })
    compnayName: string;

    @ApiProperty({ example: 'Brazilia Cerrado' })
    sampleName: string;

    @ApiProperty({ example: 'Medium' })
    roastType: string;

    @ApiProperty({ example: 'Blend' })
    coffeeType: string;

    @ApiProperty({ example: '777' })
    sampleItemId: number;

    @ApiProperty({ example: '13.12.2021' })
    roastDate: string;

    @ApiProperty({ example: '21.12.2021' })
    openDate: string;

    @ApiProperty({ description: "Weight in gramms", example: '250' })
    weight: number;

    @ApiProperty({ example: '666777' })
    barCode: string;
}