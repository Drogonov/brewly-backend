import { Injectable } from '@nestjs/common';
import { OptionListsKeys } from './generated';
import { LocalizationStringsService } from './localization-strings.service';

export interface LocalizationOptionsList {
  type: LocalizationOptionListType;
  currentOption?: LocalizedOption;
  options: LocalizedOption[];
}

export interface LocalizedOption {
  code: number;
  value: string;
}

export const LocalizationOptionListConst = {
  BEAN_ORIGIN: 'BEAN_ORIGIN',
  PROCESSING_METHOD: 'PROCESSING_METHOD',
} as const;

export type LocalizationOptionListType = typeof LocalizationOptionListConst[keyof typeof LocalizationOptionListConst];

@Injectable()
export class LocalizationOptionsListService {
  constructor(
    private readonly localizationStringsService: LocalizationStringsService
  ) {}

  private readonly optionsMap: Record<LocalizationOptionListType, OptionListsKeys[]> = {
    BEAN_ORIGIN: [
      OptionListsKeys.BEAN_ORIGIN_CODE_1,
      OptionListsKeys.BEAN_ORIGIN_CODE_2,
    ],
    PROCESSING_METHOD: [
      OptionListsKeys.PROCESSING_METHOD_CODE_1,
      OptionListsKeys.PROCESSING_METHOD_CODE_2,
      OptionListsKeys.PROCESSING_METHOD_CODE_3,
      OptionListsKeys.PROCESSING_METHOD_CODE_4,
    ],
  };

  async getOptionsList(type: LocalizationOptionListType): Promise<LocalizationOptionsList> {
    const keys = this.optionsMap[type];

    if (!keys) {
      throw new Error(`Unknown localization options list type: ${type}`);
    }

    const options = await Promise.all(
      keys.map(async (key, index) => ({
        code: index + 1, // or parse from key if you prefer
        value: await this.localizationStringsService.getOptionListText(key),
      }))
    );

    return {
      type,
      options,
    };
  }
}