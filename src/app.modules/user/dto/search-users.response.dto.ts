import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ISearchUserResponse, SearchUserResponseDto } from './search-user.response.dto';

// MARK: - Project implementation

export interface ISearchUsersResponse {
    users: ISearchUserResponse[];
}

// MARK: - Swagger class

export class SearchUsersResponseDto implements ISearchUsersResponse {
    @ApiProperty({ description: "Array of users" })
    users: ISearchUserResponse[];
}