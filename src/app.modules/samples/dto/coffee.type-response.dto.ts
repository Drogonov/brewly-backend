import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// MARK: - Project implementation

export interface ICoffeeTypeResponse {
    id: number;
    value: string;
}

// MARK: - Swagger class

export class CoffeeTypeResponseDto implements ICoffeeTypeResponse {
    @ApiProperty({ example: '666' })
    id: number;

    @ApiProperty({ example: 'Natural' })
    value: string;
}