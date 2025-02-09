import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// MARK: - Project implementation

export interface IGetDefaultCuppingSettingsResponse {
  defaultCuppingName?: string;
  randomSamplesOrder: boolean;
  openSampleNameCupping: boolean;
  singleUserCupping: boolean;
  inviteAllTeammates: boolean;
}

// MARK: - Swagger class

export class GetDefaultCuppingSettingsResponseDto implements IGetDefaultCuppingSettingsResponse {
  @ApiPropertyOptional({ description: 'Default property to create new cupping with name', example: "Cupping Name" })
  defaultCuppingName?: string;

  @ApiProperty({ description: 'Will order for each user will be unique', example: true })
  randomSamplesOrder: boolean;

  @ApiProperty({ description: 'Sample names wont be hidden', example: true })
  openSampleNameCupping: boolean;

  @ApiProperty({ description: 'Is that cupping only for you?', example: true })
  singleUserCupping: boolean;

  @ApiProperty({ description: 'Invite all your team mates from current company', example: true })
  inviteAllTeammates: boolean;
}