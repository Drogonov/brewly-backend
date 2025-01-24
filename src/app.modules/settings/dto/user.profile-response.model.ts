import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IUserInfoResponse } from './user.info-response.model';
import { ICompanyInfoResponse } from './company.info-response.model';
import { ICompanyRulesResponse } from './company.rules-response.model';

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