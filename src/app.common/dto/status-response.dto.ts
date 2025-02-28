import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// MARK: - Project implementation

export interface IStatusResponse {
    status: StatusType;
    description?: string;
}

// MARK: - Swagger class

export class StatusResponseDto implements IStatusResponse {
    @ApiProperty({ example: 'Successful' })
    status: StatusType;

    @ApiPropertyOptional({ example: 'Some text about status' })
    description?: string;
}

export enum StatusType {
    SUCCESS = 'Successful',
    INPROGRESS = 'In Progress',
    DENIED = 'Denied',
}