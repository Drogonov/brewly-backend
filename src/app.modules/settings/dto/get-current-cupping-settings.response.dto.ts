import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// MARK: - Project implementation

export interface IGetCurrentCuppingSettingsResponse {
  cuppingNumber: string;
  chosenUsersAmount?: number;
}

// MARK: - Swagger class

export class GetCurrentCuppingSettingsResponseDto implements IGetCurrentCuppingSettingsResponse {
  @ApiPropertyOptional({ description: 'Number to add to the cupping name', example: "123" })
  cuppingNumber: string;

  @ApiProperty({ description: 'Amount of users invited by default', example: 6 })
  chosenUsersAmount?: number;
}