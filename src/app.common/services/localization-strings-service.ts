import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

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

  /**
   * Retrieves a localized message for the app modules.
   * @param key The message key defined in your translation file (e.g., "errorUserAlreadyExists").
   * @returns The localized message string.
   */
  async getAuthMessage(key: string): Promise<string> {
    return this.i18n.translate(key, { lang: this.currentLang });
  }

  /**
   * Retrieves a localized message for general messages.
   * You can extend this method for different modules/namespaces if needed.
   * @param key The message key.
   * @returns The localized message string.
   */
  async getMessage(key: string): Promise<string> {
    return this.i18n.translate(key, { lang: this.currentLang });
  }
}