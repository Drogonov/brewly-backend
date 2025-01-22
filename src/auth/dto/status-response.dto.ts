import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// MARK: - Project implementation

export interface IStatusResponse {
    status: string;
}

// MARK: - Swagger class

export class StatusResponseDto implements IStatusResponse {
    @ApiProperty({ example: 'Successful' })
    status: string;
}