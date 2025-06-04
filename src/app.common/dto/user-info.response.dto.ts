import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { UserRole } from 'src/app.common/dto';

// MARK: - Project implementation

export interface IUserInfoResponse {
    userId: number;
    userName: string;
    userImageURL?: string;
    email: string;
    role?: UserRole;
    about?: string;
}

// MARK: - Swagger class

export class UserInfoResponseDto implements IUserInfoResponse {
    @ApiProperty({ example: 666 })
    @Type(() => Number)
    userId: number;

    @ApiProperty({ example: 'John Wayne' })
    userName: string;

    @ApiPropertyOptional({ description: 'Image of the user', example: "https://picsum.photos/seed/picsum/200/300" })
    userImageURL?: string;

    @ApiProperty({ example: 'test@test.com' })
    email: string;

    @ApiPropertyOptional({
        description: 'User role within the company (if assigned)',
        example: UserRole.barista,
        enum: UserRole,
        required: false,
    })
    role?: UserRole;

    @ApiPropertyOptional({ example: 'Some info about user' })
    about?: string;
}