import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidationErrorKeys } from 'src/app/common/localization/generated';
import { BooleanTransformer } from 'src/app/common/decorators';

export class SaveDefaultCuppingSettingsRequestDto {

  @ApiPropertyOptional({
    description: 'Optional default name for new cupping',
    example: 'Evening Roast',
    required: false,
  })
  @IsOptional()
  @IsString({
    context: { validationErrorKey: ValidationErrorKeys.CUPPING_NAME_INVALID_CHARS },
  })
  @MinLength(3, {
    context: { validationErrorKey: ValidationErrorKeys.CUPPING_NAME_TOO_SHORT },
  })
  @MaxLength(100, {
    context: { validationErrorKey: ValidationErrorKeys.CUPPING_NAME_TOO_LONG },
  })
  defaultCuppingName?: string;

  @ApiProperty({
    description: 'Whether each user should receive a random order of samples',
    example: true,
  })
  @IsNotEmpty({
    context: { validationErrorKey: ValidationErrorKeys.INVALID_BOOLEAN },
  })
  @BooleanTransformer()
  @IsBoolean({
    context: { validationErrorKey: ValidationErrorKeys.INVALID_BOOLEAN },
  })
  randomSamplesOrder: boolean;

  @ApiProperty({
    description: 'Whether sample names are revealed upfront',
    example: false,
  })
  @IsNotEmpty({
    context: { validationErrorKey: ValidationErrorKeys.INVALID_BOOLEAN },
  })
  @BooleanTransformer()
  @IsBoolean({
    context: { validationErrorKey: ValidationErrorKeys.INVALID_BOOLEAN },
  })
  openSampleNameCupping: boolean;

  @ApiProperty({
    description: 'Is this cupping strictly for a single user?',
    example: false,
  })
  @IsNotEmpty({
    context: { validationErrorKey: ValidationErrorKeys.INVALID_BOOLEAN },
  })
  @BooleanTransformer()
  @IsBoolean({
    context: { validationErrorKey: ValidationErrorKeys.INVALID_BOOLEAN },
  })
  singleUserCupping: boolean;

  @ApiProperty({
    description: 'Invite all teammates by default',
    example: true,
  })
  @IsNotEmpty({
    context: { validationErrorKey: ValidationErrorKeys.INVALID_BOOLEAN },
  })
  @BooleanTransformer()
  @IsBoolean({
    context: { validationErrorKey: ValidationErrorKeys.INVALID_BOOLEAN },
  })
  inviteAllTeammates: boolean;
}