import { IsNotEmpty, IsString, IsEmail, IsOptional, IsInt, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidationErrorKeys } from 'src/app/common/localization/generated';

export class GetCompanyRulesRequestDto {
  @ApiProperty({ description: 'ID of the company whose rules you want', example: 42 })
  @IsNotEmpty({
    context: { validationErrorKey: ValidationErrorKeys.COMPANY_ID_MUST_BE_INT },
  })
  @IsInt({
    context: { validationErrorKey: ValidationErrorKeys.COMPANY_ID_MUST_BE_INT },
  })
  @IsPositive({
    context: { validationErrorKey: ValidationErrorKeys.COMPANY_ID_MUST_BE_POSITIVE },
  })
  @Type(() => Number)
  companyId: number;
}

