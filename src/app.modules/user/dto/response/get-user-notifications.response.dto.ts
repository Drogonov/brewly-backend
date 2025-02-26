import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IGetUserNotificationResponse } from '../nested/get-user-notification.response.dto';

// MARK: - Project implementation

export interface IGetUserNotificationsResponse {
    notifications: IGetUserNotificationResponse[];
}

// MARK: - Swagger class

export class GetUserNotificationsResponseDto implements IGetUserNotificationsResponse {
    @ApiProperty({ description: "Array of requests" })
    notifications: IGetUserNotificationResponse[];
}