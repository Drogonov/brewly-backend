import { IsNotEmpty, IsString, IsEmail, IsOptional, IsInt, Min, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SampleTypeRequestDto } from './nested/sample-type.request.dto';
import { CoffeePackRequestDto } from './nested/coffee-pack.request.dto';
import { Type } from 'class-transformer';
import { BooleanTransformer } from 'src/app/common/decorators';
import { ValidationErrorKeys } from 'src/app/common/localization/generated';

export class ArchiveSampleDto {
  @IsNotEmpty({ context: { validationErrorKey: ValidationErrorKeys.SAMPLE_ID_REQUIRED } })
  @Type(() => Number)
  @IsInt({ context: { validationErrorKey: ValidationErrorKeys.SAMPLE_ID_MUST_BE_INT } })
  @Min(1, { context: { validationErrorKey: ValidationErrorKeys.SAMPLE_ID_MUST_BE_POSITIVE } })
  @ApiProperty({ description: 'ID of the sample to archive/unarchive' })
  sampleTypeId: number;

  @IsNotEmpty({ context: { validationErrorKey: ValidationErrorKeys.INVALID_BOOLEAN } })
  @BooleanTransformer()
  @IsBoolean({ context: { validationErrorKey: ValidationErrorKeys.INVALID_BOOLEAN } })
  @ApiProperty({ example: 'true', description: 'Set to true to archive; false to unarchive' })
  isArchived: boolean;
}