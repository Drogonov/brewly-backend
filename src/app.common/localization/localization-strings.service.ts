import { Injectable, Scope, Inject } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import {
  AuthKeys,
  BusinessErrorKeys,
  CompanyKeys,
  CuppingKeys,
  ErrorsKeys,
  Languages,
  LocalizationKey,
  OnboardingKeys,
  OptionListsKeys,
  SamplesKeys,
  SettingsKeys,
  UserKeys,
  ValidationErrorKeys
} from './generated';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { JwtPayload } from '../services/jwt-session/types';

@Injectable({ scope: Scope.REQUEST })
export class LocalizationStringsService {

  constructor(
    private readonly i18n: I18nService,
    @Inject(REQUEST)
    private readonly request: Request & { user?: JwtPayload },
  ) { }

  private get currentLang(): Languages {
    const langRaw = this.request.user?.language;
    if (langRaw && (Object.values (Languages) as string[]).includes(langRaw)) {
      return langRaw as Languages;
    } else {
      return Languages.en;
    }
  }

  async getAuthText(key: AuthKeys, args?: Record<string, any>): Promise<string> {
    return this.i18n.translate(`${LocalizationKey.auth}.${key}`, {
      lang: this.currentLang,
      args
    });
  }

  async getOptionListText(key: OptionListsKeys, args?: Record<string, any>): Promise<string> {
    return this.i18n.translate(`${LocalizationKey.optionLists}.${key}`, {
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

  async getSamplesText(key: SamplesKeys, args?: Record<string, any>): Promise<string> {
    return this.i18n.translate(`${LocalizationKey.samples}.${key}`, {
      lang: this.currentLang,
      args
    });
  }

  async getCuppingText(key: CuppingKeys, args?: Record<string, any>): Promise<string> {
    return this.i18n.translate(`${LocalizationKey.cupping}.${key}`, {
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