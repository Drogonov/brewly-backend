import { IsNotEmpty, IsString, IsEmail, IsOptional, ValidateNested, ArrayNotEmpty, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SampleTypeRequestDto } from './nested/sample-type.request.dto';
import { CoffeePackRequestDto } from './nested/coffee-pack.request.dto';
import { Type } from 'class-transformer';
import { ValidationErrorKeys } from 'src/app.common/localization/generated';

export class SampleRequestDto {
  @IsNotEmpty({ context: { validationErrorKey: ValidationErrorKeys.VALUE_REQUIRED } })
  @ValidateNested()
  @Type(() => SampleTypeRequestDto)
  @ApiProperty({ description: 'Object describing the sample type details' })
  sampleTypeInfo: SampleTypeRequestDto;

  @IsOptional()
  @IsArray({ context: { validationErrorKey: ValidationErrorKeys.ARRAY_REQUIRED } })
  @ArrayNotEmpty({ context: { validationErrorKey: ValidationErrorKeys.ARRAY_REQUIRED } })
  @ValidateNested({ each: true })
  @Type(() => CoffeePackRequestDto)
  @ApiProperty({ description: 'Array of coffee‐pack details (if any)', example: [] })
  coffeePacksInfo?: CoffeePackRequestDto[];
}