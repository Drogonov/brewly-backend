import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LocalizationOptionListType, LocalizedOption } from '../localization/localization-options-list/localization-options-list.model';

// MARK: - Project implementation

export interface IOptionListResponse {
    type: LocalizationOptionListType;
    currentOption?: IOptionResponse;
    options: IOptionResponse[];
}
export interface IOptionResponse extends LocalizedOption {}

// MARK: - Swagger class

export class OptionListResponseDto implements IOptionListResponse {
    @ApiProperty({ description: 'Type of the list' })
    type: LocalizationOptionListType;

    @ApiPropertyOptional({ description: 'Current option to preset what user should choose' })
    currentOption?: LocalizedOption;

    @ApiProperty({ description: 'Array of options to choose' })
    options: LocalizedOption[];
}