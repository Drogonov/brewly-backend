import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IOptionListResponse, OptionListResponseDto } from 'src/app/common/dto/option-list.response.dto';
import { GetCuppingSampleTestDto, IGetCuppingSampleTest } from './get-cupping-sample-text.response.dto';
import { Type } from 'class-transformer';

// MARK: - Project implementation

export interface IGetCuppingSampleResponse {
    sampleTypeId: number;
    hiddenSampleName?: string;

    companyName: string;
    sampleName: string;
    beanOrigin?: IOptionListResponse;
    procecingMethod?: IOptionListResponse;
    roastType?: number;
    grindType?: number;

    packId: number;
    roastDate: string;
    openDate?: string;
    weight: number;
    barCode?: string;

    averageScore?: number;
    test?: IGetCuppingSampleTest[];
}

// MARK: - Swagger class

export class GetCuppingSampleResponseDto implements IGetCuppingSampleResponse {

    @ApiProperty({ description: 'Id of the sample type' })
    sampleTypeId: number;

    @ApiProperty({ description: 'Name for the hidden cuppings' })
    hiddenSampleName?: string;

    @ApiProperty({ description: 'Name for the company' })
    companyName: string;

    @ApiProperty({ description: 'Name for the sample' })
    sampleName: string;

    @ApiPropertyOptional({
        description: 'Bean origin as an option list',
        type: () => OptionListResponseDto,
    })
    @Type(() => OptionListResponseDto)
    beanOrigin?: IOptionListResponse;

    @ApiPropertyOptional({
        description: 'Procecing method for coffee',
        type: () => OptionListResponseDto,
    })
    procecingMethod?: IOptionListResponse;

    @ApiProperty({ description: 'Roast type value' })
    roastType?: number;

    @ApiProperty({ description: 'Grind type value' })
    grindType?: number;

    @ApiProperty({ description: 'Id of the pack' })
    packId: number;

    @ApiProperty({ description: 'Roast date of the pack' })
    roastDate: string;

    @ApiProperty({ description: 'Open date of the pack' })
    openDate?: string;

    @ApiProperty({ description: 'Weight of the pack' })
    weight: number;

    @ApiProperty({ description: 'Bar code of the pack' })
    barCode?: string;

    @ApiProperty({ description: 'Average score of the pack' })
    averageScore?: number;

    @ApiPropertyOptional({
        description: 'Test result entries for this pack',
        type: () => GetCuppingSampleTestDto,
        isArray: true,
    })
    test?: IGetCuppingSampleTest[];
}