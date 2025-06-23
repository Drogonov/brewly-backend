import { ApiProperty } from "@nestjs/swagger";

export interface LocalizationOptionsList {
  type: LocalizationOptionListType;
  currentOption?: LocalizedOption;
  options: LocalizedOption[];
}

export interface LocalizedOption {
  code: number;
  value: string;
}

export class LocalizedOptionDto implements LocalizedOption {
  @ApiProperty({ example: 0, description: 'Code of the option' })
  code: number;

  @ApiProperty({ example: 'Mono', description: 'Value of option for current language' })
  value: string;
}

export const LocalizationOptionListConst = {
  BEAN_ORIGIN: 'BEAN_ORIGIN',
  PROCESSING_METHOD: 'PROCESSING_METHOD',
} as const;

export type LocalizationOptionListType = typeof LocalizationOptionListConst[keyof typeof LocalizationOptionListConst];