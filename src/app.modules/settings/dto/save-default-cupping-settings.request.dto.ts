import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SaveDefaultCuppingSettingsRequestDto {

  @ApiProperty({ example: "Cupping Name" })
  @IsOptional()
  defaultCuppingName?: string;

  @IsNotEmpty()
  @ApiProperty({ example: true })
  @Type(() => Boolean)
  randomSamplesOrder: boolean;

  @IsNotEmpty()
  @ApiProperty({ example: true })
  @Type(() => Boolean)
  openSampleNameCupping: boolean;

  @IsNotEmpty()
  @ApiProperty({ example: true })
  @Type(() => Boolean)
  singleUserCupping: boolean;

  @IsNotEmpty()
  @ApiProperty({ example: true })
  @Type(() => Boolean)
  inviteAllTeammates: boolean;
}