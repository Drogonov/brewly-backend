import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IIconTextNumberInfoBlockResponse } from './nested/icon-text-number-info-block.response.dto';
import { ICompanyInfoResponse, IUserInfoResponse } from 'src/app.common/dto';

// MARK: - Project implementation

export interface IGetUserSettingsResponse {
    userInfo: IUserInfoResponse;
    companyInfo: ICompanyInfoResponse;
    friendsBlock?: IIconTextNumberInfoBlockResponse;
    teamMatesBlock?: IIconTextNumberInfoBlockResponse;
    requestsBlock?: IIconTextNumberInfoBlockResponse;
    onboardingBlock?: IIconTextNumberInfoBlockResponse;
    isUserHaveNewNotifications: boolean;
}

// MARK: - Swagger class

export class GetUserSettingsResponseDto implements IGetUserSettingsResponse {
    @ApiProperty({ description: 'User Information' })
    userInfo: IUserInfoResponse;

    @ApiProperty({ description: 'Company Information' })
    companyInfo: ICompanyInfoResponse;

    @ApiPropertyOptional({ description: 'Friends Info' })
    friendsBlock?: IIconTextNumberInfoBlockResponse;

    @ApiPropertyOptional({ description: 'Teammates Info' })
    teamMatesBlock?: IIconTextNumberInfoBlockResponse;

    @ApiPropertyOptional({ description: 'Sended requests' })
    requestsBlock?: IIconTextNumberInfoBlockResponse;

    @ApiPropertyOptional({ description: 'Onboarding Info' })
    onboardingBlock?: IIconTextNumberInfoBlockResponse;

    @ApiPropertyOptional({ description: 'True if user have new notifications' })
    isUserHaveNewNotifications: boolean;
}
