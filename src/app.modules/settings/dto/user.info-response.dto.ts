import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// MARK: - Project implementation

export interface IUserInfoResponse {
    userName: string;
    companyName: string;
    email: string;
    role: string
}

// MARK: - Swagger class

export class UserInfoResponseDto implements IUserInfoResponse {
    @ApiProperty({ description: 'Имя пользователя', example: "User Name" })
    userName: string;

    @ApiProperty({ description: 'Название компании' })
    companyName: string;

    @ApiProperty({ example: 'test@test.com' })
    email: string;

    @ApiProperty({ description: 'Роль пользователя' })
    role: string;
}