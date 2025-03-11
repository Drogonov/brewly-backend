import { Injectable } from '@nestjs/common';
import { LocalizationStringsService } from 'src/app.common/services/localization-strings-service';
import { ErrorSubCodes } from 'src/app.common/error-handling/exceptions';


@Injectable()
export class ErrorHandlingService {
  constructor(private readonly localizationStringsService: LocalizationStringsService) {}

  /**
   * Given an error subcode, returns a localized error message.
   * Assumes that your localization keys follow a pattern (e.g., "auth.ERROR_INCORRECT_EMAIL").
   */
  async getLocalizedErrorMessage(errorSubCode: string): Promise<string> {
    try {
      const localized = await this.localizationStringsService.getAuthMessage(`auth.${errorSubCode}`);
      return localized || '';
    } catch (err) {
      // Fallback to empty string if localization fails
      return '';
    }
  }
}