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
    @ApiProperty({
        description: 'User Information',
        type: () => UserInfoResponseDto,
    })
    @Type(() => UserInfoResponseDto)
    userInfo: UserInfoResponseDto;

    @ApiProperty({
        description: 'Company Information',
        type: () => CompanyInfoResponseDto,
    })
    @Type(() => CompanyInfoResponseDto)
    companyInfo: CompanyInfoResponseDto;

    @ApiPropertyOptional({
        description: 'Friends Info',
        type: () => IconTextNumberInfoBlockResponseDto,
    })
    @Type(() => IconTextNumberInfoBlockResponseDto)
    friendsBlock?: IconTextNumberInfoBlockResponseDto;

    @ApiPropertyOptional({
        description: 'Teammates Info',
        type: () => IconTextNumberInfoBlockResponseDto,
    })
    @Type(() => IconTextNumberInfoBlockResponseDto)
    teamMatesBlock?: IconTextNumberInfoBlockResponseDto;

    @ApiPropertyOptional({
        description: 'Sent requests',
        type: () => IconTextNumberInfoBlockResponseDto,
    })
    @Type(() => IconTextNumberInfoBlockResponseDto)
    requestsBlock?: IconTextNumberInfoBlockResponseDto;

    @ApiPropertyOptional({
        description: 'Onboarding Info',
        type: () => IconTextNumberInfoBlockResponseDto,
    })
    @Type(() => IconTextNumberInfoBlockResponseDto)
    onboardingBlock?: IconTextNumberInfoBlockResponseDto;

    @ApiProperty({
        description: 'True if user have new notifications',
        example: true,
        type: Boolean,
    })
    isUserHaveNewNotifications: boolean;
}
