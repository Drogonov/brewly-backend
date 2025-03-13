import { ArgumentMetadata, BadRequestException, Injectable, ValidationPipe, ValidationError } from '@nestjs/common';
import { BusinessErrorException, ErrorFieldCodeType, ErrorFieldCode, ErrorSubCodeType, ErrorSubCode, ValidationErrorCodes, constraintToErrorMapping } from './exceptions';
import { LocalizationStringsService } from 'src/app.common/localization/localization-strings-service';
import { AuthKeys } from '../localization/generated/auth.enum';
import { ErrorHandlingService } from './error-handling.service';
import { ValidationErrorKeys } from '../localization/generated';

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
      const validationError = await this._validationFieldErrors(validationErrors);

      if (validationError) {
        return validationError;
      } else {
        const errorProperties = validationErrors.map((error) => error.property);
        return new BadRequestException({
          message: `Validation failed in ${errorProperties.join(', ')}`,
          validationErrors,
        });
      }
    };
  }

  async _validationFieldErrors(errors: ValidationError[]): Promise<BusinessErrorException | null> {
    const validErrors = errors.filter((error) =>
      Object.values(ErrorFieldCode).includes(error.property as ErrorFieldCodeType)
    );
  
    if (validErrors.length === 0) {
      return null;
    }
  
    const validationErrorCodes: ValidationErrorCodes[] = await Promise.all(
      validErrors.map(async (error) => {
        const constraintKeys = error.constraints ? Object.keys(error.constraints) : [];
        const constraintKey = constraintKeys[0];
  
        const errorFieldsCode = error.property as ErrorFieldCodeType;
        const validationErrorKey = await this._getValidationErrorKey(errorFieldsCode, constraintKey);
  
        return {
          errorFieldsCode,
          validationErrorKey
        };
      })
    );
  
    return await this.errorHandlingService.getValidationError(validationErrorCodes);
  }

  async _getValidationErrorKey(field: ErrorFieldCodeType, constraintKey?: string): Promise<ValidationErrorKeys> {
    const mappingForField = constraintToErrorMapping[field];
    if (mappingForField && constraintKey && mappingForField[constraintKey]) {
      return mappingForField[constraintKey];
    }
  }
}