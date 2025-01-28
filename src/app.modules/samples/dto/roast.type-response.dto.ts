import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// MARK: - Project implementation

export interface IRoastTypeResponse {
    id: number;
    value: string;
}

// MARK: - Swagger class

export class RoastTypeResponseDto implements IRoastTypeResponse {
    @ApiProperty({ example: '666' })
    id: number;

    @ApiProperty({ example: 'Medium+' })
    value: string;
}