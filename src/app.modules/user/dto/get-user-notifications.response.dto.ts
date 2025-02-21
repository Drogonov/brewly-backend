import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ISearchUserResponse, SearchUserResponseDto } from './search-user.response.dto';
import { IGetUserSendedRequestResponse } from './get-user-sended-request.response.dto';
import { IGetUserNotificationResponse } from './get-user-notification.response.dto';

// MARK: - Project implementation

export interface IGetUserNotificationsResponse {
    notifications: IGetUserNotificationResponse[];
}

// MARK: - Swagger class

export class GetUserNotificationsResponseDto implements IGetUserNotificationsResponse {
    @ApiProperty({ description: "Array of requests" })
    notifications: IGetUserNotificationResponse[];
}