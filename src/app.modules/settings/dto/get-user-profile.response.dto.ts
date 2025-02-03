import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ICompanyInfoResponse } from './company-info.response.dto';
import { ICompanyRuleResponse } from './company-rule.response.dto';
import { ISettingsUserInfoResponse } from './settings-user-info.response.dto';

// MARK: - Project implementation

export interface IGetUserProfileResponse {
    userInfo: ISettingsUserInfoResponse;
    companies: ICompanyInfoResponse[];
    createNewCompanyText: string;
    rulesForOwner: ICompanyRuleResponse[];
    rulesForChief: ICompanyRuleResponse[];
    rulesForBarista: ICompanyRuleResponse[];
}

// MARK: - Swagger class

export class GetUserProfileResponseDto implements IGetUserProfileResponse {
    @ApiProperty({ description: 'Information about user' })
    userInfo: ISettingsUserInfoResponse;

    @ApiProperty({ description: 'Companies of the user' })
    companies: ICompanyInfoResponse[];

    @ApiProperty({ example: 'Create New Company' })
    createNewCompanyText: string;

    @ApiProperty({ description: 'Rules which owner add fo himself' })
    rulesForOwner: ICompanyRuleResponse[];

    @ApiProperty({ description: 'Rules for chief added by owner or other chiefs' })
    rulesForChief: ICompanyRuleResponse[];

    @ApiProperty({ description: 'Rules for barista added by owner or chief' })
    rulesForBarista: ICompanyRuleResponse[];
}