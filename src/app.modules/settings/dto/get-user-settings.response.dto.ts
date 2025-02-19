import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ISettingsUserInfoResponse } from './settings-user-info.response.dto';
import { IIconTextNumberInfoBlockResponse } from './icon-text-number-block.response.dto';

// MARK: - Project implementation

export interface IGetUserSettingsResponse {
    title: string;
    registerUserText?: string;
    userInfo: ISettingsUserInfoResponse;
    friendsBlock?: IIconTextNumberInfoBlockResponse;
    teamMatesBlock?: IIconTextNumberInfoBlockResponse;
    requestsBlock?: IIconTextNumberInfoBlockResponse;
    onboardingBlock?: IIconTextNumberInfoBlockResponse;
    cuppingDefaultSettingsText: string;
}

// MARK: - Swagger class

export class GetUserSettingsResponseDto implements IGetUserSettingsResponse {
    @ApiProperty({ example: 'Settings 1' })
    title: string;

    @ApiPropertyOptional({ example: 'Register Brewly Account' })
    registerUserText?: string;

    @ApiProperty({ description: 'User Information' })
    userInfo: ISettingsUserInfoResponse;

    @ApiPropertyOptional({ description: 'Friends Info' })
    friendsBlock?: IIconTextNumberInfoBlockResponse;

    @ApiPropertyOptional({ description: 'Teammates Info' })
    teamMatesBlock?: IIconTextNumberInfoBlockResponse;

    @ApiPropertyOptional({ description: 'Sended requests' })
    requestsBlock?: IIconTextNumberInfoBlockResponse;

    @ApiPropertyOptional({ description: 'Onboarding Info' })
    onboardingBlock?: IIconTextNumberInfoBlockResponse;

    @ApiProperty({ example: 'Cupping Default Settings' })
    cuppingDefaultSettingsText: string;
}