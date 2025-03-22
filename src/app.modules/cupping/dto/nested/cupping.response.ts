import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CuppingStatus } from '../types/cupping-status.enum';

// MARK: - Project implementation

export interface ICuppingResponse {
    id: number
    title: string;
    dateOfTheEvent: string;
    status: CuppingStatus
}

// MARK: - Swagger class

export class CuppingResponseDto implements ICuppingResponse {
    @ApiProperty({ example: 666 })
    id: number;

    @ApiProperty({ example: 'Cupping 1' })
    title: string;

    // ISO8601 format date
    @ApiProperty({ example: "2025-01-01T00:00:00Z" })
    dateOfTheEvent: string;

    @ApiProperty({ example: "inProgress" })
    status: CuppingStatus;
}

