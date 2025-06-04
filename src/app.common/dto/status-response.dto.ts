import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum StatusType {
    SUCCESS = 'Successful',
    INPROGRESS = 'In Progress',
    DENIED = 'Denied',
}

// MARK: - Project implementation

export interface IStatusResponse {
    status: StatusType;
    description?: string;
}

// MARK: - Swagger class

export class StatusResponseDto implements IStatusResponse {
    @ApiProperty({
        example: StatusType.SUCCESS,
        enum: StatusType,
        description: 'Current status of the requested operation',
      })
    status: StatusType;

    @ApiPropertyOptional({ example: 'Some text about status' })
    description?: string;
}