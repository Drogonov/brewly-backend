import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { AuthKeys, BusinessErrorKeys, Languages, LocalizationKey, ValidationErrorKeys } from './generated';

@Injectable()
export class LocalizationStringsService {

  // MARK: Private Methods

  private currentLang: Languages = Languages.en;

  // MARK: Construction

  constructor(
    private readonly i18n: I18nService
  ) {}

  // MARK: Methods

  setLanguage(lang: Languages): void {
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