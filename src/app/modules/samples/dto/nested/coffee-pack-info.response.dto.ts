import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// MARK: - Project implementation

export interface ICoffeePackInfoResponse {
    id: number;
    roastDate: string;
    openDate?: string;
    weight: number;
    barCode?: string;
    packIsOver?: boolean
}

// MARK: - Swagger class

export class CoffeePackInfoResponseDto implements ICoffeePackInfoResponse {
    @ApiProperty({description: "pack id", example: 666 })
    id: number
    // ISO8601 format date
    @ApiPropertyOptional({ example: "2025-01-01T00:00:00Z" })
    roastDate: string;

    // ISO8601 format date
    @ApiPropertyOptional({ example: "2025-01-01T00:00:00Z" })
    openDate?: string;

    @ApiProperty({description: "weight in gramms", example: 250 })
    weight: number;

    @ApiPropertyOptional({ description: 'Pack bar code' })
    barCode?: string;

    @ApiPropertyOptional({ example: true })
    packIsOver?: boolean;
}