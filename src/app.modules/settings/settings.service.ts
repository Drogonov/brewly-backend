import { Injectable } from '@nestjs/common';
import { IGetUserSettingsResponse, IStatusResponse } from './dto';
import { UserRole } from './dto/settings-user-info.response.dto';

@Injectable()
export class SettingsService {

    async getUserSettings(userId: number, currentCompanyId: number): Promise<IGetUserSettingsResponse> {
        return {
            title: "Settings",
            registerUserText: "Register Brewly Account",
            userInfo: {
                userName: 'Test Test',
                companyName: 'Personal',
                email: 'test@test.com',
                role: UserRole.owner
            },
            friendsBlock: {
                iconName: 'person',
                text: 'Friends',
                number: 10
            },
            teamMatesBlock: {
                iconName: 'person.line.dotted.person',
                text: 'Team Mates',
                number: 0
            },
            onboardingBlock: {
                iconName: 'questionmark.bubble',
                text: 'Onboarding'
            },
            cuppingDefaultSettingsText: "Cupping Default Settings"
        };
    }

    async saveDefaultCuppingSettings(userId: number, companyId: number): Promise<IStatusResponse> {
        return {
            status: "Successful"
        };
    }
}