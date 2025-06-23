import { IsNotEmpty, IsString, IsEmail, IsOptional, IsNumber, IsArray, ArrayMinSize, ValidateNested, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CuppingSettingsRequestDto } from './nested/cupping-settings.request.dto';
import { CuppingSampleRequestDto } from './nested/cupping-sample.request.dto';
import { Type } from 'class-transformer';
import { ValidationErrorKeys } from 'src/app/common/localization/generated';

export class CreateCuppingRequestDto {
  @IsArray({
    context: { validationErrorKey: ValidationErrorKeys.TESTS_ARRAY_REQUIRED },
  })
  @ArrayMinSize(1, {
    context: { validationErrorKey: ValidationErrorKeys.TESTS_ARRAY_REQUIRED },
  })
  @ValidateNested({ each: true })
  @Type(() => CuppingSampleRequestDto)
  @ApiProperty({
    description: 'At least one sample is required',
    type: () => CuppingSampleRequestDto,
    isArray: true,
  })
  samples: CuppingSampleRequestDto[]

  @ValidateNested()
  @Type(() => CuppingSettingsRequestDto)
  @ApiProperty({
    description: 'Cupping settings object',
    type: () => CuppingSettingsRequestDto,
  })
  settings: CuppingSettingsRequestDto

  @IsOptional()
  @IsArray({
    context: { validationErrorKey: ValidationErrorKeys.USER_ID_MUST_BE_POSITIVE },
  })
  @IsInt({ each: true, context: { validationErrorKey: ValidationErrorKeys.USER_ID_MUST_BE_INT } })
  @Type(() => Number)
  @ApiProperty({
    description: 'IDs of users to invite (optional)',
    example: [1, 3, 777],
    type: () => Number,
    isArray: true
  })
  chosenUserIds?: number[]
}