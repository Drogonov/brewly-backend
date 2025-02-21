import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ISearchUserResponse, SearchUserResponseDto } from './search-user.response.dto';
import { IGetUserSendedRequestResponse } from './get-user-sended-request.response.dto';

// MARK: - Project implementation

export interface IGetUserSendedRequestsResponse {
    requests: IGetUserSendedRequestResponse[];
}

// MARK: - Swagger class

export class GetUserSendedRequestsResponseDto implements IGetUserSendedRequestsResponse {
    @ApiProperty({ description: "Array of requests" })
    requests: IGetUserSendedRequestResponse[];
}