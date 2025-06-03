import { IsNotEmpty, IsEnum, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CuppingStatus } from './types/cupping-status.enum';
import { ValidationErrorKeys } from 'src/app.common/localization/generated';

export class SetCuppingStatusRequestDto {
  @IsNotEmpty({
    context: { validationErrorKey: ValidationErrorKeys.CUPPING_ID_REQUIRED },
  })
  @Type(() => Number)
  @IsInt({
    context: { validationErrorKey: ValidationErrorKeys.CUPPING_ID_MUST_BE_INT },
  })
  @Min(1, {
    context: { validationErrorKey: ValidationErrorKeys.CUPPING_ID_MUST_BE_POSITIVE },
  })
  @ApiProperty({ example: 123, description: 'Numeric ID of the cupping to update' })
  cuppingId: number;

  @IsNotEmpty({
    context: { validationErrorKey: ValidationErrorKeys.CUPPING_STATUS_REQUIRED },
  })
  @IsEnum(CuppingStatus, {
    context: { validationErrorKey: ValidationErrorKeys.CUPPING_STATUS_INVALID },
  })
  @ApiProperty({
    enum: CuppingStatus,
    description: 'Target status (one of: planned, inProgress, doneByCurrentUser, ended)',
  })
  cuppingStatus: CuppingStatus;
}