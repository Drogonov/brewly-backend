import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// MARK: - Project implementation

export interface ISettingsUserInfoResponse {
    userName: string;
    companyName?: string;
    email: string;
    role: UserRole;
}

// MARK: - Swagger class

export class SettingsUserInfoResponseDto implements ISettingsUserInfoResponse {
    @ApiProperty({ description: 'Name of the user', example: "User Name" })
    userName: string;

    @ApiPropertyOptional({ description: 'Current user company name' })
    companyName?: string;

    @ApiProperty({ example: 'test@test.com' })
    email: string;

    @ApiProperty({ description: 'User role', example: "owner" })
    role: UserRole;
}

export enum UserRole {
    owner = 'owner',
    chief = 'chief',
    barista = 'barista',
}