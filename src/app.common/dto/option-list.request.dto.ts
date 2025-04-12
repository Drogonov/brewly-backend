import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LocalizationOptionListType, LocalizedOption } from '../localization/localization-options-list/localization-options-list.model';

export class OptionListRequestDto {
    @IsNotEmpty()
    @ApiProperty({ description: 'Type of the chosen option' })
    type: LocalizationOptionListType;

    @IsNotEmpty()
    @ApiProperty({ description: 'Chosen by user option' })
    chosenOption: LocalizedOption;
}