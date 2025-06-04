import { IsNotEmpty, IsString, IsNumber, Min, Max, IsOptional, MinLength, MaxLength, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidationErrorKeys } from 'src/app.common/localization/generated';

export class SampleTypeRequestDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { context: { validationErrorKey: ValidationErrorKeys.SAMPLE_ID_MUST_BE_INT } })
  @Min(1, { context: { validationErrorKey: ValidationErrorKeys.SAMPLE_ID_MUST_BE_POSITIVE } })
  @ApiProperty({ example: 666, description: 'If updating an existing sample, provide its ID; otherwise omit.' })
  sampleTypeId?: number;

  @IsNotEmpty({ context: { validationErrorKey: ValidationErrorKeys.COMPANY_NAME_REQUIRED } })
  @IsString({ context: { validationErrorKey: ValidationErrorKeys.COMPANY_NAME_INVALID_CHARS } })
  @MinLength(2, { context: { validationErrorKey: ValidationErrorKeys.COMPANY_NAME_TOO_SHORT } })
  @MaxLength(50, { context: { validationErrorKey: ValidationErrorKeys.COMPANY_NAME_TOO_LONG } })
  @ApiProperty({ example: 'Tasty Coffee', description: 'Name of the company that produced this sample' })
  companyName: string;

  @IsNotEmpty({ context: { validationErrorKey: ValidationErrorKeys.SAMPLE_NAME_REQUIRED } })
  @IsString({ context: { validationErrorKey: ValidationErrorKeys.SAMPLE_NAME_INVALID_CHARS } })
  @MinLength(2, { context: { validationErrorKey: ValidationErrorKeys.SAMPLE_NAME_TOO_SHORT } })
  @MaxLength(100, { context: { validationErrorKey: ValidationErrorKeys.SAMPLE_NAME_TOO_LONG } })
  @ApiProperty({ example: 'Irgachiff 4', description: 'Internal name for this sample' })
  sampleName: string;

  @IsNotEmpty({ context: { validationErrorKey: ValidationErrorKeys.BEAN_ORIGIN_CODE_REQUIRED } })
  @Type(() => Number)
  @IsNumber({}, { context: { validationErrorKey: ValidationErrorKeys.BEAN_ORIGIN_CODE_INVALID } })
  @Min(1, { context: { validationErrorKey: ValidationErrorKeys.BEAN_ORIGIN_CODE_OUT_OF_RANGE } })
  @Max(2, { context: { validationErrorKey: ValidationErrorKeys.BEAN_ORIGIN_CODE_OUT_OF_RANGE } })
  @ApiProperty({ example: 1, description: 'Code of bean origin must be between 1 and 2 (option list)' })
  beanOriginCode: number;

  @IsNotEmpty({ context: { validationErrorKey: ValidationErrorKeys.PROCESSING_METHOD_CODE_REQUIRED } })
  @Type(() => Number)
  @IsNumber({}, { context: { validationErrorKey: ValidationErrorKeys.PROCESSING_METHOD_CODE_INVALID } })
  @Min(1, { context: { validationErrorKey: ValidationErrorKeys.PROCESSING_METHO_CODE_OUT_OF_RANGE } })
  @Max(4, { context: { validationErrorKey: ValidationErrorKeys.PROCESSING_METHO_CODE_OUT_OF_RANGE } })
  @ApiProperty({ example: 2, description: 'Code of processing method must be between 1 and 4 (option list)' })
  processingMethodCode: number;

  @IsNotEmpty({ context: { validationErrorKey: ValidationErrorKeys.ROAST_TYPE_REQUIRED } })
  @Type(() => Number)
  @IsNumber({}, { context: { validationErrorKey: ValidationErrorKeys.ROAST_TYPE_INVALID } })
  @Min(0, { context: { validationErrorKey: ValidationErrorKeys.ROAST_TYPE_OUT_OF_RANGE } })
  @Max(5, { context: { validationErrorKey: ValidationErrorKeys.ROAST_TYPE_OUT_OF_RANGE } })
  @ApiProperty({ description: 'Roast level (0–5)', example: 3 })
  roastType: number;

  @IsNotEmpty()
  @Type(() => Number)
  @Min(0, {})
  @Max(10, {})
  @ApiProperty({description: "range from 1 to 10 of grind value", example: 1 })


  @IsNotEmpty({ context: { validationErrorKey: ValidationErrorKeys.GRIND_TYPE_REQUIRED } })
  @Type(() => Number)
  @IsNumber({}, { context: { validationErrorKey: ValidationErrorKeys.GRIND_TYPE_INVALID } })
  @Min(0, { context: { validationErrorKey: ValidationErrorKeys.GRIND_TYPE_OUT_OF_RANGE } })
  @Max(10, { context: { validationErrorKey: ValidationErrorKeys.GRIND_TYPE_OUT_OF_RANGE } })
  @ApiProperty({ description: 'Grind level (0–10)', example: 7 })
  grindType: number;

  @IsOptional()
  @IsArray({ context: { validationErrorKey: ValidationErrorKeys.LABELS_ARRAY_INVALID } })
  @IsString({ each: true, context: { validationErrorKey: ValidationErrorKeys.LABELS_ARRAY_INVALID_CHARS } })
  @ApiPropertyOptional({
    description: 'Labels of the pack (e.g. ["Microlot", "Decaf"])',
    example: ['Microlot', 'Decaf'],
  })
  labels?: [string];
}