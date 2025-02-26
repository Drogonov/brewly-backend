import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IGetUserSendedRequestResponse } from '../nested/get-user-sended-request.response.dto';

// MARK: - Project implementation

export interface IGetUserSendedRequestsResponse {
    requests: IGetUserSendedRequestResponse[];
}

// MARK: - Swagger class

export class GetUserSendedRequestsResponseDto implements IGetUserSendedRequestsResponse {
    @ApiProperty({ description: "Array of requests" })
    requests: IGetUserSendedRequestResponse[];
}