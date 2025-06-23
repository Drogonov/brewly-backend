import { IsNotEmpty, IsString, IsEmail, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BooleanTransformer } from 'src/app/common/decorators';
import { ValidationErrorKeys } from 'src/app/common/localization/generated';

export class CuppingSettingsRequestDto {
  @IsNotEmpty({
    context: { validationErrorKey: ValidationErrorKeys.CUPPING_NAME_REQUIRED },
  })
  @IsString({
    context: { validationErrorKey: ValidationErrorKeys.CUPPING_NAME_INVALID_CHARS },
  })
  @MinLength(3, {
    context: { validationErrorKey: ValidationErrorKeys.CUPPING_NAME_TOO_SHORT },
  })
  @MaxLength(100, {
    context: { validationErrorKey: ValidationErrorKeys.CUPPING_NAME_TOO_LONG },
  })
  @ApiProperty({ example: 'Spring Tasting #1' })
  cuppingName: string

  @IsNotEmpty({
    context: { validationErrorKey: ValidationErrorKeys.INVALID_BOOLEAN },
  })
  @BooleanTransformer()
  @IsBoolean({
    context: { validationErrorKey: ValidationErrorKeys.INVALID_BOOLEAN },
  })
  @ApiProperty({ example: true })
  randomSamplesOrder: boolean

  @IsNotEmpty({
    context: { validationErrorKey: ValidationErrorKeys.INVALID_BOOLEAN },
  })
  @BooleanTransformer()
  @IsBoolean({
    context: { validationErrorKey: ValidationErrorKeys.INVALID_BOOLEAN },
  })
  @ApiProperty({ example: true })
  openSampleNameCupping: boolean

  @IsNotEmpty({
    context: { validationErrorKey: ValidationErrorKeys.INVALID_BOOLEAN },
  })
  @BooleanTransformer()
  @IsBoolean({
    context: { validationErrorKey: ValidationErrorKeys.INVALID_BOOLEAN },
  })
  @ApiProperty({ example: true })
  singleUserCupping: boolean

  @IsNotEmpty({
    context: { validationErrorKey: ValidationErrorKeys.INVALID_BOOLEAN },
  })
  @BooleanTransformer()
  @IsBoolean({
    context: { validationErrorKey: ValidationErrorKeys.INVALID_BOOLEAN },
  })
  @ApiProperty({ example: true })
  inviteAllTeammates: boolean
}