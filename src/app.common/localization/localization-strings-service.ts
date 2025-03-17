import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import {
  AuthKeys,
  BusinessErrorKeys,
  CompanyKeys,
  ErrorsKeys,
  Languages,
  LocalizationKey,
  OnboardingKeys,
  SettingsKeys,
  UserKeys,
  ValidationErrorKeys
} from './generated';

@Injectable()
export class LocalizationStringsService {
  private currentLang: Languages = Languages.en;

  constructor(private readonly i18n: I18nService) { }

  setLanguage(lang: Languages): void {
    this.currentLang = lang;
  }

  getLanguage(): string {
    return this.currentLang;
  }

  async getAuthText(key: AuthKeys, args?: Record<string, any>): Promise<string> {
    return this.i18n.translate(`${LocalizationKey.auth}.${key}`, {
      lang: this.currentLang,
      args
    });
  }

  async getCompanyText(key: CompanyKeys, args?: Record<string, any>): Promise<string> {
    return this.i18n.translate(`${LocalizationKey.company}.${key}`, {
      lang: this.currentLang,
      args
    });
  }

  async getOnboardingText(key: OnboardingKeys, args?: Record<string, any>): Promise<string> {
    return this.i18n.translate(`${LocalizationKey.onboarding}.${key}`, {
      lang: this.currentLang,
      args
    });
  }

  async getSettingsText(key: SettingsKeys, args?: Record<string, any>): Promise<string> {
    return this.i18n.translate(`${LocalizationKey.settings}.${key}`, {
      lang: this.currentLang,
      args
    });
  }

  async getUserText(key: UserKeys, args?: Record<string, any>): Promise<string> {
    return this.i18n.translate(`${LocalizationKey.user}.${key}`, {
      lang: this.currentLang,
      args
    });
  }

  async getBusinessErrorText(key: BusinessErrorKeys, args?: Record<string, any>): Promise<string> {
    return this.i18n.translate(`${LocalizationKey.businessError}.${key}`, {
      lang: this.currentLang,
      args
    });
  }

  async getErrorText(key: ErrorsKeys, args?: Record<string, any>): Promise<string> {
    return this.i18n.translate(`${LocalizationKey.errors}.${key}`, {
      lang: this.currentLang,
      args
    });
  }

  async getValidationErrorText(key: ValidationErrorKeys, args?: Record<string, any>): Promise<string> {
    return this.i18n.translate(`${LocalizationKey.validationError}.${key}`, {
      lang: this.currentLang,
      args
    });
  }
}