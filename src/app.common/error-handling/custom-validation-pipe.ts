import { ArgumentMetadata, BadRequestException, Injectable, ValidationPipe, ValidationError } from '@nestjs/common';
import { BusinessErrorException, ErrorFieldCodeType, ErrorFieldCode, ErrorSubCodeType, ErrorSubCode, ValidationErrorCodes, constraintToErrorMapping } from './exceptions';
import { LocalizationStringsService } from 'src/app.common/localization/localization-strings.service';
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
      // 1) flatten everything…
      const flat = this.flattenErrors(validationErrors);
  
      // 2) log only your flattened errors
      console.log('Validation failures:', flat);
  
      // 3) check for any business-mapped errors
      const businessErrors = await this.validationFieldErrors(
        flat.map(fe => ({
          property: fe.property,
          constraints: fe.constraints,
        })) as any,
      );
      if (businessErrors) {
        return businessErrors;
      }
  
      // 4) otherwise return a BadRequestException with a concise payload
      return new BadRequestException({
        message: 'Validation failed',
        errors: flat.map(fe => ({
          field: fe.property,
          messages: Object.values(fe.constraints),
        })),
      });
    };
  }
  // MARK: - Private Methods

  private async validationFieldErrors(errors: ValidationError[]): Promise<BusinessErrorException | null> {
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
        const validationErrorKey = await this.getValidationErrorKey(errorFieldsCode, constraintKey);

        return {
          errorFieldsCode,
          validationErrorKey
        };
      })
    );

    return await this.errorHandlingService.getValidationError(validationErrorCodes);
  }

  private async getValidationErrorKey(field: ErrorFieldCodeType, constraintKey?: string): Promise<ValidationErrorKeys> {
    const mappingForField = constraintToErrorMapping[field];
    if (mappingForField && constraintKey && mappingForField[constraintKey]) {
      return mappingForField[constraintKey];
    }
  }

  private flattenErrors(
    errors: ValidationError[],
    parentPath = '',
  ): Array<{
    property: string;
    value: any;
    constraints: ValidationError['constraints'];
  }> {
    return errors.reduce((acc, err) => {
      const path = parentPath
        ? `${parentPath}.${err.property}`
        : err.property;

      // if there are real constraint failures on this node,
      // capture them (with the fully-qualified path)
      if (err.constraints) {
        acc.push({
          property: path,
          value: err.value,
          constraints: err.constraints,
        });
      }

      // then recurse into children, if any
      if (err.children && err.children.length) {
        acc.push(...this.flattenErrors(err.children, path));
      }

      return acc;
    }, [] as Array<{
      property: string;
      value: any;
      constraints: ValidationError['constraints'];
    }>);
  }

}