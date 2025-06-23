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
  @ApiPropertyOptional({
    description: 'Default property to create new cupping with name',
    example: 'Cupping Name',
    type: String,
  })
  defaultCuppingName?: string;

  @ApiProperty({
    description: 'Will order for each user will be unique',
    example: true,
    type: Boolean,
  })
  randomSamplesOrder: boolean;

  @ApiProperty({
    description: 'Sample names won’t be hidden',
    example: true,
    type: Boolean,
  })
  openSampleNameCupping: boolean;

  @ApiProperty({
    description: 'Is that cupping only for you?',
    example: true,
    type: Boolean,
  })
  singleUserCupping: boolean;

  @ApiProperty({
    description: 'Invite all your teammates from current company',
    example: true,
    type: Boolean,
  })
  inviteAllTeammates: boolean;
}