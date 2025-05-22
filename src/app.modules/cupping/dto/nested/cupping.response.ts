import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CuppingStatus } from '../types/cupping-status.enum';

// MARK: - Project implementation

export interface ICuppingResponse {
    id: number
    title: string;
    creationDate: string;
    eventDate?: string;    
    status: CuppingStatus
}

// MARK: - Swagger class

export class CuppingResponseDto implements ICuppingResponse {
    @ApiProperty({ example: 666 })
    id: number;

    @ApiProperty({ example: 'Cupping 1' })
    title: string;

    @ApiProperty({ example: '2025-01-15T12:00:00Z' })
    creationDate: string;

    @ApiProperty({ example: '2025-02-01T00:00:00Z' })
    eventDate?: string;

    @ApiProperty({ example: CuppingStatus.inProgress })
    status: CuppingStatus;
}

