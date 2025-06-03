import { IsNotEmpty, IsString, IsOptional, IsInt, Matches, MaxLength, Min, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidationErrorKeys } from 'src/app.common/localization/generated';

export class EditCompanyRequestDto {

  @ApiPropertyOptional({ example: 666, description: 'When provided, edits an existing company; otherwise creates a new one.' })
  @IsOptional()
  @Type(() => Number)
  @Min(1, { context: { validationErrorKey: ValidationErrorKeys.COMPANY_ID_MUST_BE_POSITIVE } })
  companyId?: number;

  @ApiProperty({ example: 'Some Company Name', description: 'Name of the company (2–50 chars, letters/numbers/spaces/hyphens only).' })
  @IsNotEmpty({ context: { validationErrorKey: ValidationErrorKeys.COMPANY_NAME_TOO_LONG } })
  @IsString({ context: { validationErrorKey: ValidationErrorKeys.COMPANY_NAME_INVALID_CHARS } })
  @MinLength(2, { context: { validationErrorKey: ValidationErrorKeys.COMPANY_NAME_TOO_SHORT } })
  @MaxLength(50, { context: ValidationErrorKeys.COMPANY_NAME_TOO_LONG })
  companyName: string;
}