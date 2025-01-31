import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaveDefaultCuppingSettingsRequestDto {

  @IsNotEmpty()
  @ApiProperty({ example: 666 })
  userId: number

  @IsNotEmpty()
  @ApiProperty({ example: 666 })
  companyId: number

  @IsNotEmpty()
  @ApiProperty({ example: true })
  randomSamplesOrder: boolean

  @IsNotEmpty()
  @ApiProperty({ example: true })
  openSampleNameCupping: boolean

  @IsNotEmpty()
  @ApiProperty({ example: true })
  singleUserCupping: boolean

  @IsNotEmpty()
  @ApiProperty({ example: true })
  inviteAllTeammates: boolean
}