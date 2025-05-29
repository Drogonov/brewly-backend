import { IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CuppingStatus } from './types/cupping-status.enum';

export class SetCuppingStatusRequestDto {
  @IsNotEmpty()
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  cuppingId: number;

  @IsNotEmpty()
  @ApiProperty({ enum: CuppingStatus })
  cuppingStatus: CuppingStatus;
}