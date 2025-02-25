import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from 'src/app.common/dto';

// MARK: - Project implementation

export interface IGetUserDataResponse {
    userId: number;
    userName: string;
    userImageURL?: string;
    email: string;
    about?: string;
}

// MARK: - Swagger class

export class GetUserDataResponseDto implements IGetUserDataResponse {
    @ApiProperty({ example: 666 })
    userId: number;

    @ApiProperty({ example: 'John Wayne' })
    userName: string;

    @ApiPropertyOptional({ description: 'Image of the user', example: "https://picsum.photos/seed/picsum/200/300" })
    userImageURL?: string;

    @ApiProperty({ example: 'test@test.com' })
    email: string;

    @ApiPropertyOptional({ example: "Some info about user" })
    about?: string;
}