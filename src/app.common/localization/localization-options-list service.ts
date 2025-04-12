import { Injectable } from '@nestjs/common';

@Injectable()
export class LocalizationOptionsListService {
    getOptionsList(type: LocalizationOptionListType): Promise<LocalizationOptionsList> {

        


    }
}

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