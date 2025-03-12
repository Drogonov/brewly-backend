import { ArgumentMetadata, BadRequestException, Injectable, ValidationPipe, ValidationError } from '@nestjs/common';
import { BusinessErrorException, ErrorSubCodes } from './exceptions';
import { LocalizationStringsService } from 'src/app.common/localization/localization-strings-service';
import { AuthKeys } from '../localization/generated/auth.enum';

@Injectable()
export class CustomValidationPipe extends ValidationPipe {
  constructor(private readonly localizationStringsService: LocalizationStringsService) {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });
  }

  override createExceptionFactory() {
    return async (validationErrors: ValidationError[] = []) => {
      const errors = validationErrors.map((error) => {
        const constraints = Object.values(error.constraints || {});
        return {
          property: error.property,
          constraints,
        };
      });

      const businessErrorException = await this._checkBusinessErrorException(errors);
      if (businessErrorException) {
        return businessErrorException;
      } else {
        const localizedValidationFailed = ""
        // const localizedValidationFailed = await this.localizationStringsService.getMessage('validation.VALIDATION_FAILED');
        return new BadRequestException({
          message: localizedValidationFailed || 'Validation failed',
          errors,
        });
      }
    };
  }

  async _checkBusinessErrorException(
    errors: {
      property: string;
      constraints: string[];
    }[]
  ) {
    const emailError = errors.find(
      (error) =>
        error.property === 'email' &&
        error.constraints &&
        Object.values(error.constraints).length > 0
    );

    if (emailError) {
      let localizedErrorMsg = '';
      try {
        localizedErrorMsg = await this.localizationStringsService.getAuthMessage(AuthKeys.UserNotFound);
      } catch (err) {
        // Fallback if localization fails
        localizedErrorMsg = '';
      }
      return new BusinessErrorException({
        errorSubCode: ErrorSubCodes.INCORRECT_EMAIL,
        errorMsg: localizedErrorMsg || "Email is incorrect",
        errorFields: [{
          fieldCode: "email",
          errorMsg: localizedErrorMsg || "Email isn't valid, please check",
        }],
      });
    }
  }
}