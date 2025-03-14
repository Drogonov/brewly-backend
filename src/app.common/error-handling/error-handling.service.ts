import { Injectable } from '@nestjs/common';
import { LocalizationStringsService } from 'src/app.common/localization/localization-strings-service';
import { ErrorFieldCodeType, ValidationErrorCodes, BusinessErrorException, ErrorSubCodeType, ErrorSubCode } from './exceptions';
import { ErrorFieldResponseDto } from '../dto';
import { BusinessErrorKeys } from '../localization/generated';

@Injectable()
export class ErrorHandlingService {
  constructor(
    private readonly localizationStringsService: LocalizationStringsService
  ) {}

  async getBusinessError(errorSubCode: ErrorSubCodeType): Promise<BusinessErrorException> {
    const key = await this._getBusinessErrorKey(errorSubCode);
    const errorMsg = await this.localizationStringsService.getBusinessErrorText(key);
    return new BusinessErrorException({
      errorSubCode,
      errorMsg,
    });
  }

  async getValidationError(errors: ValidationErrorCodes[]): Promise<BusinessErrorException> {
    const errorFields: ErrorFieldResponseDto[] = await Promise.all(
      errors.map(async (error) => ({
        fieldCode: error.errorFieldsCode,
        errorMsg: await this.localizationStringsService.getValidationErrorText(error.validationErrorKey),
      }))
    );
  
    return new BusinessErrorException({
      errorSubCode: ErrorSubCode.VALIDATION_ERROR,
      errorFields,
    });
  }

  // MARK: - Private Methods
  
  private _getBusinessErrorKey(errorSubCode: ErrorSubCodeType): Promise<BusinessErrorKeys> {
    return Promise.resolve(
      this._isBusinessErrorKey(errorSubCode)
        ? errorSubCode
        : BusinessErrorKeys.UNEXPECTED_ERROR
    );
  }

  private _isBusinessErrorKey(key: string): key is BusinessErrorKeys {
    return Object.values(BusinessErrorKeys).includes(key as BusinessErrorKeys);
  }
}