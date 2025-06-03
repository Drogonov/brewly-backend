import { ForbiddenException, Injectable } from '@nestjs/common';
import { LocalizationStringsService } from 'src/app.common/localization/localization-strings.service';
import { ValidationErrorCodes, BusinessErrorException } from './exceptions';
import { ErrorFieldResponseDto } from '../dto';
import { BusinessErrorKeys, ErrorsKeys } from '../localization/generated';

@Injectable()
export class ErrorHandlingService {
  constructor(
    private readonly localizationStringsService: LocalizationStringsService
  ) {}

  async getBusinessError(errorSubCode: BusinessErrorKeys, args?: Record<string, any>): Promise<BusinessErrorException> {
    const errorMsg = await this.localizationStringsService.getBusinessErrorText(errorSubCode, args);
    return new BusinessErrorException({
      errorSubCode,
      errorMsg,
    });
  }

  async getForbiddenError(key: ErrorsKeys): Promise<ForbiddenException> {
    const errorMsg = await this.localizationStringsService.getErrorText(key);
    return new ForbiddenException(errorMsg);
  }

  async getValidationError(errors: ValidationErrorCodes[]): Promise<BusinessErrorException> {
    const errorFields: ErrorFieldResponseDto[] = await Promise.all(
      errors.map(async (error) => ({
        fieldCode: error.errorFieldsCode,
        errorMsg: await this.localizationStringsService.getValidationErrorText(error.validationErrorKey),
      }))
    );
  
    return new BusinessErrorException({
      errorSubCode: BusinessErrorKeys.VALIDATION_ERROR,
      errorFields,
    });
  }

  // MARK: - Private Methods
  
  private isBusinessErrorKey(key: string): key is BusinessErrorKeys {
    return Object.values(BusinessErrorKeys).includes(key as BusinessErrorKeys);
  }
}