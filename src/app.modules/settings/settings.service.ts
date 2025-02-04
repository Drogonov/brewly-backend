import { Injectable } from '@nestjs/common';
import {
    SaveDefaultCuppingSettingsRequestDto,
    IGetUserSettingsResponse,
    IStatusResponse,
    IGetDefaultCuppingSettingsResponse,
    IGetUserProfileResponse,
    UserRole
} from './dto';

@Injectable()
export class SettingsService {

    async getUserSettings(
        userId: number,
        currentCompanyId: number
    ): Promise<IGetUserSettingsResponse> {
        return {
            title: "Settings",
            registerUserText: "Register Brewly Account",
            userInfo: {
                userName: 'Test Test',
                userImageURL: "https://picsum.photos/seed/picsum/200/300",
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

    async saveDefaultCuppingSettings(dto: SaveDefaultCuppingSettingsRequestDto): Promise<IStatusResponse> {
        return {
            status: "successful"
        };
    }

    async getDefaultCuppingSettings(userId: number, currentCompanyId: number): Promise<IGetDefaultCuppingSettingsResponse> {
        return {
            randomSamplesOrder: true,
            openSampleNameCupping: false,
            singleUserCupping: false,
            inviteAllTeammates: true
        };
    }

    async getUserProfile(userId: number, currentCompanyId: number): Promise<IGetUserProfileResponse> {
        return {
            userInfo: {
                userName: 'Test Test',
                userImageURL: "https://picsum.photos/seed/picsum/200/300",
                companyName: 'Personal',
                email: 'test@test.com',
                role: UserRole.owner
            },
            companies: [
                {
                    id: 0,
                    isCurrent: true,
                    isPersonal: true
                },
                {
                    id: 1,
                    companyName: "Znak Coffee",
                    isCurrent: false,
                    isPersonal: false
                }
            ],
            createNewCompanyText: "Create new Company",
            rulesForOwner: [
                {
                    id: 0,
                    name: 'Am i Chief',
                    value: false
                }
            ],
            rulesForChief: [
                {
                    id: 1,
                    name: 'Can Chief Make Chief',
                    value: false
                },
                {
                    id: 2,
                    name: 'Can Chief invite User',
                    value: false
                },
                {
                    id: 3,
                    name: 'Can Chief create cupping',
                    value: false
                },
                {
                    id: 4,
                    name: 'Is Chief rates preferred',
                    value: false
                }
            ],
            rulesForBarista: [
                {
                    id: 5,
                    name: 'Can Barista invite users',
                    value: false
                },
                {
                    id: 6,
                    name: 'Can Barista create cupping',
                    value: false
                }
            ]
        };
    }
}