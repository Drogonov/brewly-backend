import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from 'src/app.common/dto';

// MARK: - Project implementation

export interface IGetUserSendedRequestResponse {
    requestId: number;
    requestDate: string;
    description: string;
    status?: string;
}

// MARK: - Swagger class

export class GetUserSendedRequestResponseDto implements IGetUserSendedRequestResponse {
    @ApiProperty({ example: 666 })
    requestId: number;

    // must be ISO8601
    @ApiProperty({ example: "2025-01-01T00:00:00Z" })
    requestDate: string;

    @ApiProperty({ example: "Заявка на добавление в друзья пользователя Some User" })
    description: string;

    @ApiPropertyOptional({ example: "В процессе" })
    status?: string;
}