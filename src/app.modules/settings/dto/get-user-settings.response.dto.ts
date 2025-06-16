import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IconTextNumberInfoBlockResponseDto, IIconTextNumberInfoBlockResponse } from './nested/icon-text-number-info-block.response.dto';
import { CompanyInfoResponseDto, ICompanyInfoResponse, IUserInfoResponse, UserInfoResponseDto } from 'src/app.common/dto';
import { Type } from 'class-transformer';

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
    @Type(() => UserInfoResponseDto)
    userInfo: UserInfoResponseDto;

    @ApiProperty({ description: 'Company Information' })
    @Type(() => CompanyInfoResponseDto)
    companyInfo: CompanyInfoResponseDto;

    @ApiPropertyOptional({ description: 'Friends Info' })
    @Type(() => IconTextNumberInfoBlockResponseDto)
    friendsBlock?: IconTextNumberInfoBlockResponseDto;

    @ApiPropertyOptional({ description: 'Teammates Info' })
    @Type(() => IconTextNumberInfoBlockResponseDto)
    teamMatesBlock?: IconTextNumberInfoBlockResponseDto;

    @ApiPropertyOptional({ description: 'Sent requests' })
    @Type(() => IconTextNumberInfoBlockResponseDto)
    requestsBlock?: IconTextNumberInfoBlockResponseDto;

    @ApiPropertyOptional({ description: 'Onboarding Info' })
    @Type(() => IconTextNumberInfoBlockResponseDto)
    onboardingBlock?: IconTextNumberInfoBlockResponseDto;

    @ApiPropertyOptional({ description: 'True if user have new notifications' })
    isUserHaveNewNotifications: boolean;
}
