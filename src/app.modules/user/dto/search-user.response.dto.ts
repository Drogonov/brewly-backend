import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// MARK: - Project implementation

export interface ISearchUserResponse {
    userId: number;
    userName: string;
    email: string;
    isChief: boolean;
    isOwner: boolean;
}

// MARK: - Swagger class

export class SearchUserResponseDto implements ISearchUserResponse {
    @ApiProperty({ example: 666 })
    userId: number;

    @ApiProperty({ example: 'John Wayne' })
    userName: string;

    @ApiProperty({ example: 'test@test.com' })
    email: string;

    @ApiProperty({ example: true })
    isChief: boolean;

    @ApiProperty({ example: true })
    isOwner: boolean;
}