import { ArgumentMetadata, BadRequestException, Injectable, ValidationPipe, ValidationError } from '@nestjs/common';
import { BusinessErrorException, ErrorFieldCodeType, ErrorFieldCode, ErrorSubCodeType, ErrorSubCode, ValidationErrorCodes } from './exceptions';
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
      // 1) Flatten all nested ValidationError objects into an array of “flat” errors,
      //    each containing: property, value, constraints, contexts.
      const flat = this.flattenErrors(validationErrors);

      // 2) Try to convert any of these flat errors into a BusinessErrorException
      //    by looking for `contexts[constraintName].validationErrorKey` on each.
      const businessErrors = await this.validationFieldErrors(flat);

      if (businessErrors) {
        return businessErrors; // → will be thrown as HTTP 422 + BusinessErrorException payload
      }

      // 3) Otherwise, no “context‐backed” keys were found. Fall back to a generic 400
      //    that includes each field’s raw constraint message(s).

      const allProps = flat.map(r => r.property).join(', ');
      const allConstraints = flat
        .map(r => Object.values(r.constraints ?? {}).join(', '))
        .join('; ');

      const error = await this.errorHandlingService.getBusinessError(
        ErrorSubCode.VALIDATION_NON_FIELD_ERROR,
        {
          property: `"${allProps}"`,
          message: `"${allConstraints}"`,
        }
      );

      return error
    };
  }

  // MARK: - Private Methods

  // ---------------------------------------
  // Recursively flatten nested ValidationError nodes into a simple array:
  // Each entry has:
  //   • property: string (e.g. 'email' or 'user.address.street')
  //   • value:    the actual value that failed
  //   • constraints: { [constraintName: string]: string }
  //   • contexts:    { [constraintName: string]: any }
  // ---------------------------------------
  private flattenErrors(
    errors: ValidationError[],
    parentPath = '',
  ): Array<{
    property: string;
    value: any;
    constraints?: ValidationError['constraints'];
    contexts?: ValidationError['contexts'];
  }> {
    return errors.reduce((acc, err) => {
      const path = parentPath ? `${parentPath}.${err.property}` : err.property;

      if (err.constraints) {
        acc.push({
          property: path,
          value: err.value,
          constraints: err.constraints,
          contexts: err.contexts,
        });
      }
      if (err.children && err.children.length) {
        acc.push(...this.flattenErrors(err.children, path));
      }
      return acc;
    }, [] as Array<{
      property: string;
      value: any;
      constraints?: ValidationError['constraints'];
      contexts?: ValidationError['contexts'];
    }>);
  }

  // ---------------------------------------
  // Attempt to build a BusinessErrorException
  // from any field that (a) is listed in ErrorFieldCode, and (b) has at least
  // one constraint whose contexts[...] includes a validationErrorKey.
  // If at least one such “keyed” error exists, we return a 422‐style exception.
  // Otherwise, return null so the generic BadRequestException is used instead.
  // ---------------------------------------
  private async validationFieldErrors(
    errors: Array<{
      property: string;
      constraints?: ValidationError['constraints'];
      contexts?: ValidationError['contexts'];
    }>,
  ): Promise<BusinessErrorException | null> {
    // 1) Keep only those fields whose property name matches one of ErrorFieldCode
    const validErrors = errors.filter(fe =>
      Object.values(ErrorFieldCode).includes(
        fe.property as ErrorFieldCodeType,
      ),
    );

    if (validErrors.length === 0) {
      return null;
    }

    // 2) For each field, pick its first failed constraint, then see if that constraint
    //    has a contexts[constraintName].validationErrorKey.  If it does, collect it.
    const codes: ValidationErrorCodes[] = validErrors
      .map(fe => {
        if (!fe.constraints) {
          return null;
        }
        // e.g. fe.constraints = { isEmail: 'some fallback text', isString: '...' }
        const constraintNames = Object.keys(fe.constraints);
        if (constraintNames.length === 0) {
          return null;
        }
        const firstConstraint = constraintNames[0]; // e.g. 'isEmail' or 'minLength'

        // contexts might be undefined if you didn't set `context: { … }`
        const ctxObj = fe.contexts?.[firstConstraint] as
          | { validationErrorKey: ValidationErrorKeys }
          | undefined;

        if (!ctxObj || !ctxObj.validationErrorKey) {
          // No context.key found → skip this field when building BusinessErrorException
          return null;
        }

        return {
          errorFieldsCode: fe.property as ErrorFieldCodeType,
          validationErrorKey: ctxObj.validationErrorKey,
        };
      })
      .filter((x): x is ValidationErrorCodes => x !== null);

    if (codes.length === 0) {
      return null;
    }

    // 3) If we did collect at least one field+key, throw a 422 BusinessErrorException
    return this.errorHandlingService.getValidationError(codes);
  }
}