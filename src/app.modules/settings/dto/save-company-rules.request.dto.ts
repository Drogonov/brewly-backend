import { ArrayMinSize, IsArray, IsBoolean, IsInt, IsNotEmpty, IsPositive, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ValidationErrorKeys } from 'src/app.common/localization/generated';
import { BooleanTransformer } from 'src/app.common/decorators';

export class CompanyRuleRequestDto {
  @ApiProperty({ description: 'Rule ID in the system', example: 123456789 })
  @IsNotEmpty({
    context: { validationErrorKey: ValidationErrorKeys.NUMBER_REQUIRED },
  })
  @IsInt({
    context: { validationErrorKey: ValidationErrorKeys.NUMBER_INVALID },
  })
  @IsPositive({
    context: { validationErrorKey: ValidationErrorKeys.NUMBER_MUST_BE_POSITIVE },
  })
  @Type(() => Number)
  id: number;

  @ApiProperty({ description: 'Name (label) of the rule', example: 'Can Chief change rules?' })
  @IsNotEmpty({
    context: { validationErrorKey: ValidationErrorKeys.INVALID_CHARS },
  })
  @IsString({
    context: { validationErrorKey: ValidationErrorKeys.INVALID_CHARS },
  })
  name: string;

  @ApiProperty({ description: 'Boolean flag: is this rule enabled?', example: true })
  @IsNotEmpty({
    context: { validationErrorKey: ValidationErrorKeys.INVALID_BOOLEAN },
  })
  @BooleanTransformer()
  @IsBoolean({
    context: { validationErrorKey: ValidationErrorKeys.INVALID_BOOLEAN },
  })
  value: boolean;
}

export class SaveCompanyRulesRequestDto {
  @ApiProperty({ description: 'ID of the company for which rules are being saved', example: 42 })
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

  @ApiProperty({
    description: 'Array of rules (each with id, name, value) to update',
    isArray: true,
    type: CompanyRuleRequestDto,
  })
  @IsNotEmpty({
    context: { validationErrorKey: ValidationErrorKeys.ARRAY_REQUIRED },
  })
  @IsArray({
    context: { validationErrorKey: ValidationErrorKeys.ARRAY_REQUIRED },
  })
  @ArrayMinSize(1, {
    context: { validationErrorKey: ValidationErrorKeys.ARRAY_MUST_BE_NOT_EMPTY },
  })
  @ValidateNested({ each: true })
  @Type(() => CompanyRuleRequestDto)
  rules: CompanyRuleRequestDto[];
}