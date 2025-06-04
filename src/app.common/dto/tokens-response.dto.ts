import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// MARK: - Project implementation

export interface ITokensResponse {
  access_token: string;
  refresh_token: string;
};

// MARK: - Swagger class

export class TokensResponseDto implements ITokensResponse {
  @ApiProperty({
    description: 'JWT access token (short-lived)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…',
  })
  access_token: string;

  @ApiProperty({
    description: 'JWT refresh token (longer-lived)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…',
  })
  refresh_token: string;
}