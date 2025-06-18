import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IUserInfoResponse, UserInfoResponseDto } from 'src/app.common/dto';

// MARK: - Project implementation

export interface ISearchUsersResponse {
    users: IUserInfoResponse[];
}

// MARK: - Swagger class

export class SearchUsersResponseDto implements ISearchUsersResponse {
    @ApiProperty({
        description: 'Array of users',
        type: () => UserInfoResponseDto,
        isArray: true,
    })
    @Type(() => UserInfoResponseDto)
    users: IUserInfoResponse[];
}