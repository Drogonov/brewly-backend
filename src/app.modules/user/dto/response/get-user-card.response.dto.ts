import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IUserInfoResponse, UserInfoResponseDto, UserRole } from 'src/app.common/dto';
import { GetUserActionDto, IGetUserAction } from '../nested/get-user-action.response.dto';
import { Type } from 'class-transformer';

// MARK: - Project implementation

export interface IGetUserCardResponse {
    userInfo: IUserInfoResponse;
    status: string;
    actions: IGetUserAction[]
}

// MARK: - Swagger class

export class GetUserCardResponseDto implements IGetUserCardResponse {
    @ApiProperty({
        description: 'Information about user',
        type: () => UserInfoResponseDto,
    })
    @Type(() => UserInfoResponseDto)
    userInfo: IUserInfoResponse;

    @ApiProperty({ example: 'Friend, teammate' })
    status: string;

    @ApiProperty({
        description: 'User interaction actions',
        type: () => GetUserActionDto,
        isArray: true,
    })
    @Type(() => GetUserActionDto)
    actions: IGetUserAction[]
}