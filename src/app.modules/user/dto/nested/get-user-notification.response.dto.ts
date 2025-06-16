import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from 'src/app.common/dto';
import { UserNotificationType } from '../types/user-notification-type';

// MARK: - Project implementation

export interface IGetUserNotificationResponse {
    notificationId: number;
    notificationDate: string;
    iconName: string;
    description: string;
    type: UserNotificationType;
    senderId: number;
    cuppingId?: number;
    wasLoadedByReceiver: boolean;
}

// MARK: - Swagger class

export class GetUserNotificationResponseDto implements IGetUserNotificationResponse {
    @ApiProperty({ example: 666, type: Number })
    notificationId: number;

    @ApiProperty({
        example: '2025-01-01T00:00:00Z',
        description: 'ISO8601 date',
        type: String,
    })
    notificationDate: string;

    @ApiProperty({ example: 'trash', type: String })
    iconName: string;

    @ApiProperty({ example: '… description …', type: String })
    description: string;

    @ApiProperty({
        description: 'Type of the notification',
        enum: UserNotificationType,
        example: UserNotificationType.friendRequest,
        type: String,
    })
    type: UserNotificationType;

    @ApiProperty({ example: 666, type: Number })
    senderId: number;

    @ApiPropertyOptional({ example: 666, type: Number })
    cuppingId?: number;

    @ApiProperty({ example: false, type: Boolean })
    wasLoadedByReceiver: boolean;
}