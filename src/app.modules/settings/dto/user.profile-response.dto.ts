import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IUserInfoResponse } from './user.info-response.dto';
import { ICompanyInfoResponse } from './company.info-response.dto';
import { ICompanyRulesResponse } from './company.rules-response.dto';

// MARK: - Project implementation

export interface IUserProfileResponse {
    userInfo: IUserInfoResponse;
    companies: [ICompanyInfoResponse];
    createNewCompanyText: string;
    companyRules: ICompanyRulesResponse;
}

// MARK: - Swagger class

export class UserProfileResponseDto implements IUserProfileResponse {
    @ApiProperty({ description: 'Информация о пользователе' })
    userInfo: IUserInfoResponse;

    @ApiProperty({ description: 'Доступные компании пользователя' })
    companies: [ICompanyInfoResponse];

    @ApiProperty({ example: 'Create New Company' })
    createNewCompanyText: string;

    @ApiProperty({ description: 'Правила установленные для компании' })
    companyRules: ICompanyRulesResponse;
}