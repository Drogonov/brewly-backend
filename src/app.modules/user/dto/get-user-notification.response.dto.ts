import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from 'src/app.common/dto';
import { UserNotificationType } from './user-notification-type';

// MARK: - Project implementation

export interface IGetUserNotificationResponse {
    notificationId: number;
    notificationDate: string;
    iconName: string;
    description: string;
    type: UserNotificationType;
}

// MARK: - Swagger class

export class GetUserNotificationResponseDto implements IGetUserNotificationResponse {
    @ApiProperty({ example: 666 })
    notificationId: number;

    // must be ISO8601
    @ApiProperty({ example: "2025-01-01T00:00:00Z" })
    notificationDate: string;

    @ApiProperty({ example: "trash" })
    iconName: string;

    @ApiProperty({ example: "Заявка на добавление в друзья пользователя Some User" })
    description: string;

    @ApiPropertyOptional({ example: UserNotificationType.friendRequest })
    type: UserNotificationType;
}