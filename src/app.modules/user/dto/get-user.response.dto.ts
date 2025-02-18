import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from 'src/app.common/dto';
import { IGetUserAction } from './get-user-action.response.dto';

// MARK: - Project implementation

export interface IGetUserResponse {
    userId: number;
    userName: string;
    userImageURL?: string;
    email: string;
    comment?: string;
    role: UserRole;
    status: string;
    actions: IGetUserAction[]
}

// MARK: - Swagger class

export class GetUserResponseDto implements IGetUserResponse {
    @ApiProperty({ example: 666 })
    userId: number;

    @ApiProperty({ example: 'John Wayne' })
    userName: string;

    @ApiPropertyOptional({ description: 'Image of the user', example: "https://picsum.photos/seed/picsum/200/300" })
    userImageURL?: string;

    @ApiProperty({ example: 'test@test.com' })
    email: string;

    @ApiPropertyOptional({ example: "Some info about user" })
    comment?: string;

    @ApiProperty({ example: "barista" })
    role: UserRole;

    @ApiProperty({ example: 'Friend, teammate' })
    status: string;

    @ApiProperty({ description: "user interaction actions" })
    actions: IGetUserAction[]
}