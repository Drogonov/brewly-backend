import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IUserInfoResponse } from 'src/app.common/dto';

// MARK: - Project implementation

export interface ISearchUsersResponse {
    users: IUserInfoResponse[];
}

// MARK: - Swagger class

export class SearchUsersResponseDto implements ISearchUsersResponse {
    @ApiProperty({ description: "Array of users" })
    users: IUserInfoResponse[];
}