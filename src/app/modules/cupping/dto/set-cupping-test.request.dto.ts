import { IsNotEmpty, IsArray, ValidateNested, ArrayMinSize, IsOptional, IsIn, IsInt, Min, Max, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TestType } from 'src/app/modules/cupping/dto/types/test-type.enum';
import { ValidationErrorKeys } from 'src/app/common/localization/generated';

class PropertyDto {
  @IsNotEmpty({
    context: { validationErrorKey: ValidationErrorKeys.TEST_PROPERTY_TYPE_REQUIRED },
  })
  @IsIn(Object.values(TestType), {
    context: { validationErrorKey: ValidationErrorKeys.TEST_PROPERTY_TYPE_INVALID },
  })
  @ApiProperty({ enum: TestType, description: 'Which property is being rated' })
  testPropertyType: TestType;

  @IsNotEmpty({
    context: { validationErrorKey: ValidationErrorKeys.INTENSITY_REQUIRED },
  })
  @IsInt({
    context: { validationErrorKey: ValidationErrorKeys.INTENSITY_MUST_BE_INT },
  })
  @Min(0, {
    context: { validationErrorKey: ValidationErrorKeys.INTENSITY_OUT_OF_RANGE },
  })
  @Max(5, {
    context: { validationErrorKey: ValidationErrorKeys.INTENSITY_OUT_OF_RANGE },
  })
  @ApiProperty({ example: 5, description: 'Intensity rating' })
  @Type(() => Number)
  intensity: number;

  @IsNotEmpty({
    context: { validationErrorKey: ValidationErrorKeys.QUALITY_REQUIRED },
  })
  @IsInt({
    context: { validationErrorKey: ValidationErrorKeys.QUALITY_MUST_BE_INT },
  })
  @Min(0, {
    context: { validationErrorKey: ValidationErrorKeys.QUALITY_OUT_OF_RANGE },
  })
  @Max(5, {
    context: { validationErrorKey: ValidationErrorKeys.QUALITY_OUT_OF_RANGE },
  })
  @ApiProperty({ example: 5, description: 'Quality rating' })
  @Type(() => Number)
  quality: number;

  @IsOptional()
  @IsString({
    context: { validationErrorKey: ValidationErrorKeys.COMMENT_INVALID_CHARS },
  })
  @MinLength(1, {
    context: { validationErrorKey: ValidationErrorKeys.COMMENT_TOO_SHORT },
  })
  @MaxLength(250, {
    context: { validationErrorKey: ValidationErrorKeys.COMMENT_TOO_LONG },
  })
  @ApiPropertyOptional({
    example: 'Nice aromas',
    description: 'Optional comment by user',
  })
  comment?: string;
}

export class SetCuppingTestRequestDto {
  @IsNotEmpty({
    context: { validationErrorKey: ValidationErrorKeys.CUPPING_ID_REQUIRED },
  })
  @IsInt({
    context: { validationErrorKey: ValidationErrorKeys.CUPPING_ID_MUST_BE_INT },
  })
  @Min(1, {
    context: { validationErrorKey: ValidationErrorKeys.CUPPING_ID_MUST_BE_POSITIVE },
  })
  @Type(() => Number)
  @ApiProperty({ example: 1 })
  cuppingId: number;

  @IsNotEmpty({
    context: { validationErrorKey: ValidationErrorKeys.COFFEE_PACK_ID_REQUIRED },
  })
  @IsInt({
    context: { validationErrorKey: ValidationErrorKeys.COFFEE_PACK_ID_MUST_BE_INT },
  })
  @Min(1, {
    context: { validationErrorKey: ValidationErrorKeys.COFFEE_PACK_ID_MUST_BE_POSITIVE },
  })
  @Type(() => Number)
  @ApiProperty({ example: 10 })
  coffeePackId: number;

  @IsArray({
    context: { validationErrorKey: ValidationErrorKeys.PROPERTIES_ARRAY_REQUIRED },
  })
  @ArrayMinSize(1, {
    context: { validationErrorKey: ValidationErrorKeys.PROPERTIES_ARRAY_REQUIRED },
  })
  @ValidateNested({ each: true })
  @Type(() => PropertyDto)
  @ApiProperty({
    type: () => PropertyDto,
    isArray: true
  })
  properties: PropertyDto[];
}

export class SetCuppingTestsRequestDto {
  @IsArray({
    context: { validationErrorKey: ValidationErrorKeys.TESTS_ARRAY_REQUIRED },
  })
  @ArrayMinSize(1, {
    context: { validationErrorKey: ValidationErrorKeys.TESTS_ARRAY_REQUIRED },
  })
  @ValidateNested({ each: true })
  @Type(() => SetCuppingTestRequestDto)
  @ApiProperty({
    type: () => SetCuppingTestRequestDto,
    isArray: true,
    description: 'One or more individual cupping test entries',
  })
  tests: SetCuppingTestRequestDto[];
}