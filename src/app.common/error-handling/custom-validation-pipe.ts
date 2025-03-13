import { ArgumentMetadata, BadRequestException, Injectable, ValidationPipe, ValidationError } from '@nestjs/common';
import { BusinessErrorException, ErrorFieldCodeType, ErrorFieldCode, ErrorSubCodeType, ErrorSubCode, ValidationErrorCodes, constraintToErrorMapping } from './exceptions';
import { LocalizationStringsService } from 'src/app.common/localization/localization-strings-service';
import { AuthKeys } from '../localization/generated/auth.enum';
import { ErrorHandlingService } from './error-handling.service';

@Injectable()
export class CustomValidationPipe extends ValidationPipe {
  constructor(
    private readonly errorHandlingService: ErrorHandlingService
  ) {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });
  }

  override createExceptionFactory() {
    return async (validationErrors: ValidationError[] = []) => {
      const errorProperties = validationErrors.map((error) => error.property);
      const validationError = await this._validationFieldErrors(errorProperties);

      console.log(validationErrors);

      if (validationError) {
        return validationError;
      } else {
        return new BadRequestException({
          message: `Validation failed in ${errorProperties.join(', ')}`,
          validationErrors,
        });
      }
    };
  }

  async _validationFieldErrors(fields: string[]): Promise<BusinessErrorException | null> {
    const fieldCodes: ErrorFieldCodeType[] = fields.filter(
      (field): field is ErrorFieldCodeType => Object.values(ErrorFieldCode).includes(field as ErrorFieldCodeType)
    );

    if (fieldCodes.length === 0) {
      return null;
    }
  
    const validationErrorCodes: ValidationErrorCodes[] = await Promise.all(
      fieldCodes.map(async (fieldCode) => ({
        errorSubCode: await this._getErrorSubCodeForField(fieldCode),
        errorFieldsCode: fieldCode
      }))
    );

    return await this.errorHandlingService.getValidationError(validationErrorCodes);  
  }

  async _getErrorSubCodeForField(field: ErrorFieldCodeType, constraintKey?: string): Promise<ErrorSubCodeType> {
    switch (field) {
      case ErrorFieldCode.email:
        return ErrorSubCode.INCORRECT_EMAIL;

      case ErrorFieldCode.password:
        return ErrorSubCode.INCORRECT_PASSWORD;

      default:
        return ErrorSubCode.VALIDATION_ERROR;
    }
  }

  // async _getErrorSubCodeForError(field: ErrorFieldCodeType, constraintKey?: string): Promise<ErrorSubCodeType> {
  //   if (constraintKey && constraintToErrorMapping[constraintKey]) {
  //     return constraintToErrorMapping[constraintKey];
  //   }
  //   return ErrorSubCode.VALIDATION_ERROR;
  // }
}