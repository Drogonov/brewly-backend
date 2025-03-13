import { Injectable } from '@nestjs/common';
import { LocalizationStringsService } from 'src/app.common/localization/localization-strings-service';
import { ErrorFieldCodeType, ValidationErrorCodes, BusinessErrorException, ErrorSubCodeType, ErrorSubCode } from './exceptions';
import { ErrorFieldResponseDto } from '../dto';

@Injectable()
export class ErrorHandlingService {
  constructor(
    private readonly localizationStringsService: LocalizationStringsService
  ) {}

  async getBusinessError(errorSubCode: ErrorSubCodeType): Promise<BusinessErrorException> {
    // Cast errorSubCode to any (or to BusinessErrorKeys if you’re sure it’s valid) for localization
    const errorMsg = await this.localizationStringsService.getBusinessErrorText(errorSubCode as any);
    return new BusinessErrorException({
      errorSubCode,
      errorMsg,
    });
  }

  async getValidationError(errors: ValidationErrorCodes[]): Promise<BusinessErrorException> {
    const errorFields: ErrorFieldResponseDto[] = await Promise.all(
      errors.map(async (error) => ({
        fieldCode: error.errorFieldsCode,
        errorMsg: await this.localizationStringsService.getValidationErrorText(error.errorSubCode as any),
      }))
    );
  
    return new BusinessErrorException({
      errorSubCode: ErrorSubCode.VALIDATION_ERROR,
      errorFields,
    });
  }
}