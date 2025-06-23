import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GetUserSendedRequestResponseDto, IGetUserSendedRequestResponse } from '../nested/get-user-sended-request.response.dto';
import { Type } from 'class-transformer';

// MARK: - Project implementation

export interface IGetUserSendedRequestsResponse {
    requests: IGetUserSendedRequestResponse[];
}

// MARK: - Swagger class

export class GetUserSendedRequestsResponseDto implements IGetUserSendedRequestsResponse {
    @ApiProperty({
        description: 'Array of requests',
        type: () => GetUserSendedRequestResponseDto,
        isArray: true,
    })
    @Type(() => GetUserSendedRequestResponseDto)
    requests: IGetUserSendedRequestResponse[];
}