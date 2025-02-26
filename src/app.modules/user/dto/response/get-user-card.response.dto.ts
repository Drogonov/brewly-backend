import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IUserInfoResponse, UserRole } from 'src/app.common/dto';
import { IGetUserAction } from '../nested/get-user-action.response.dto';

// MARK: - Project implementation

export interface IGetUserCardResponse {
    userInfo: IUserInfoResponse;
    status: string;
    actions: IGetUserAction[]
}

// MARK: - Swagger class

export class GetUserCardResponseDto implements IGetUserCardResponse {
    @ApiProperty({ description: "Information about user" })
    userInfo: IUserInfoResponse;

    @ApiProperty({ example: 'Friend, teammate' })
    status: string;

    @ApiProperty({ description: "user interaction actions" })
    actions: IGetUserAction[]
}