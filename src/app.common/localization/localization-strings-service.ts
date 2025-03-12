import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { AuthKeys } from './generated/auth.enum';
import { LocalizationKey } from './generated/localization-key.enum';
import { BusinessErrorKeys } from './generated/business-error.enum';
import { ValidationErrorKeys } from './generated/validation-error.enum';

@Injectable()
export class LocalizationStringsService {
  private currentLang: string = 'en';

  constructor(private readonly i18n: I18nService) {}

  setLanguage(lang: string): void {
    this.currentLang = lang;
  }

  getLanguage(): string {
    return this.currentLang;
  }

  async getAuthText(key: AuthKeys): Promise<string> {
    return this.i18n.translate(`${LocalizationKey.auth}.${key}`, { lang: this.currentLang });
  }

  async getBusinessErrorText(key: BusinessErrorKeys): Promise<string> {
    return this.i18n.translate(`${LocalizationKey.businessError}.${key}`, { lang: this.currentLang });
  }

  async getValidationErrorText(key: ValidationErrorKeys): Promise<string> {
    return this.i18n.translate(`${LocalizationKey.validationError}.${key}`, { lang: this.currentLang });
  }
}