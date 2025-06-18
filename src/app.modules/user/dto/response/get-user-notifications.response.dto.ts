import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GetUserNotificationResponseDto, IGetUserNotificationResponse } from '../nested/get-user-notification.response.dto';
import { Type } from 'class-transformer';

// MARK: - Project implementation

export interface IGetUserNotificationsResponse {
    notifications: IGetUserNotificationResponse[];
}

// MARK: - Swagger class

export class GetUserNotificationsResponseDto implements IGetUserNotificationsResponse {
    @ApiProperty({
        description: 'Array of notifications',
        type: () => GetUserNotificationResponseDto,
        isArray: true,
    })
    @Type(() => GetUserNotificationResponseDto)
    notifications: IGetUserNotificationResponse[];
}