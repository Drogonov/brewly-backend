import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  ValidationPipe,
  ValidationError,
} from '@nestjs/common';
import { BusinessErrorException, ErrorSubCodes } from './exceptions';
import { error } from 'console';

@Injectable()
export class CustomValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });
  }

  override createExceptionFactory() {
    return (validationErrors: ValidationError[] = []) => {
      const errors = validationErrors.map((error) => {
        const constraints = Object.values(error.constraints || {});
        return {
          property: error.property,
          constraints,
        };
      });

      const businessErrorException = this._checkBusinessErrorException(errors);
      if (businessErrorException) {
        return businessErrorException;
      } else {
        return new BadRequestException({
          message: 'Validation failed',
          errors,
        });
      }
    };
  }

  // MARK: - Private Methods
  
  _checkBusinessErrorException(
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
      return new BusinessErrorException({
        errorSubCode: ErrorSubCodes.INCORRECT_EMAIL,
        errorMsg: "Email is incorrect",
        errorFields: [{
          fieldCode: "email",
          errorMsg: "Email isnt email pls check"
        }]
      });
    };
  }
}
