import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaveDefaultCuppingSettingsRequestDto {

  @ApiProperty({ example: "Cupping Name" })
  @IsOptional()
  defaultCuppingName?: string;

  @IsNotEmpty()
  @ApiProperty({ example: true })
  randomSamplesOrder: boolean;

  @IsNotEmpty()
  @ApiProperty({ example: true })
  openSampleNameCupping: boolean;

  @IsNotEmpty()
  @ApiProperty({ example: true })
  singleUserCupping: boolean;

  @IsNotEmpty()
  @ApiProperty({ example: true })
  inviteAllTeammates: boolean;
}