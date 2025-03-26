import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// MARK: - Project implementation

export interface ICoffeePackInfoResponse {
    roastDate: string;
    openDate?: string;
    wheight: number;
    barCode?: string;
    packIsOver?: boolean
}

// MARK: - Swagger class

export class CoffeePackInfoResponseDto implements ICoffeePackInfoResponse {
    // ISO8601 format date
    @ApiPropertyOptional({ example: "2025-01-01T00:00:00Z" })
    roastDate: string;

    // ISO8601 format date
    @ApiPropertyOptional({ example: "2025-01-01T00:00:00Z" })
    openDate?: string;

    @ApiProperty({description: "wheight in gramms", example: 250 })
    wheight: number;

    @ApiPropertyOptional({ description: 'Pack bar code' })
    barCode?: string;

    @ApiPropertyOptional({ example: true })
    packIsOver?: boolean;
}