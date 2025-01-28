import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// MARK: - Project implementation

export interface ISuccessIdResponse {
    id: number;
}

// MARK: - Swagger class

export class SuccessIdResponseDto implements ISuccessIdResponse {
    @ApiProperty({ example: '666' })
    id: number;
}