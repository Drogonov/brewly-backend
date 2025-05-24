import { IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CuppingType } from '@prisma/client';
import { Type } from 'class-transformer';

export class SetCuppingTypeRequestDto {
  @IsNotEmpty()
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  cuppingId: number;

  @IsNotEmpty()
  @IsEnum(CuppingType)
  @ApiProperty({ enum: CuppingType })
  cuppingType: CuppingType;
}