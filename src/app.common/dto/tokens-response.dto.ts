import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// MARK: - Project implementation

export interface ITokensResponse {
  access_token: string;
  refresh_token: string;
};

// MARK: - Swagger class

export class TokensResponseDto implements ITokensResponse {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYW50b25AdmxlemtvLmNvbSIsImlhdCI6MTczMjA5MTI4NiwiZXhwIjoxNzMyMDkyMTg2fQ.V5_gB8StUKLlBTiBrMLHNvQiLx_e3gscSF6xUYsmQzc' })
    access_token: string;

    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjUsImVtYWlsIjoidGVzdDEyM0B0ZXN0LmNvbSIsImlhdCI6MTczMTkxNDg0NCwiZXhwIjoxNzMyNTE5NjQ0fQ.sj5t3EUFMDhai_t2xyzdNtKMVjNGTRhjQYNMZtwu0Xk' })
    refresh_token: string;
}