import { Injectable } from '@nestjs/common';
import { IGetUserSettingsResponse, IStatusResponse } from './dto';

@Injectable()
export class SettingsService {

    async getUserSettings(userId: number): Promise<IGetUserSettingsResponse> {
        return {
            title: "",
            registerUserText: "",
            userInfo: {
                userName: '',
                companyName: '',
                email: '',
                role: ''
            },
            friendsBlock: {
                iconName: '',
                text: '',
                number: 0
            },
            teamMatesBlock: {
                iconName: '',
                text: '',
                number: 0
            },
            onboardingBlock: {
                iconName: '',
                text: '',
                number: 0
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