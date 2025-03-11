import { Injectable } from '@nestjs/common';
import { LocalizationStringsService } from 'src/app.services/services/localization-strings-service';

@Injectable()
export class ErrorHandlingService {
  constructor(private readonly localizationStringsService: LocalizationStringsService) {}

  /**
   * Given an error subcode, returns a localized error message.
   * Assumes that your localization keys follow a pattern (e.g., "auth.ERROR_INCORRECT_EMAIL").
   */
  async getLocalizedErrorMessage(errorSubCode: string): Promise<string> {
    // You can adjust the key format as needed.
    return this.localizationStringsService.getAuthMessage(`auth.${errorSubCode}`);
  }
}