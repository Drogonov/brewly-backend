import { Injectable } from '@nestjs/common';
import { LocalizationStringsService } from '../localization-strings.service';
import { OptionListsKeys } from '../generated';
import { LocalizationOptionListType, LocalizationOptionsList } from './localization-options-list.model';

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

  async getOptionsList(type: LocalizationOptionListType, currenOptionCode?: number): Promise<LocalizationOptionsList> {
    const keys = this.optionsMap[type];

    if (!keys) {
      throw new Error(`Unknown localization options list type: ${type}`);
    }

    const options = await Promise.all(
      keys.map(async (key) => ({
        code: this.extractCodeFromKey(key),
        value: await this.localizationStringsService.getOptionListText(key),
      }))
    );

    const currentOption = options.find((option) => option.code == currenOptionCode);

    return {
      type,
      currentOption,
      options,
    };
  }

  private extractCodeFromKey(key: OptionListsKeys): number {
    const match = key.match(/_CODE_(\d+)$/);
    if (!match) {
      throw new Error(`Invalid option key format: ${key}`);
    }
    return parseInt(match[1], 10);
  }
}