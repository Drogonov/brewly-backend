import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import internal from 'stream';

// MARK: - Project implementation

export interface ISearchSampleTypeResponse {
    sampleTypeId: number;
    compnayName: string;
    sampleName: string;
    roastType: string;
    coffeeType: string;
}

// MARK: - Swagger class

export class SearchSampleTypeResponseDto implements ISearchSampleTypeResponse {

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
}