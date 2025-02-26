import { Injectable } from '@nestjs/common';
import {
    SaveDefaultCuppingSettingsRequestDto,
    IGetUserSettingsResponse,
    IStatusResponse,
    IGetDefaultCuppingSettingsResponse,
    StatusType,
    IGetCompanyRulesResponse,
    SaveCompanyRulesRequestDto,
    StatusResponseDto
} from './dto';
import { UserRole } from 'src/app.common/dto';

@Injectable()
export class SettingsService {

    async getUserSettings(
        userId: number,
        currentCompanyId: number
    ): Promise<IGetUserSettingsResponse> {
        return {
            userInfo: {
                userId: 0,
                userName: 'Test Test',
                userImageURL: "https://picsum.photos/seed/picsum/200/300",
                email: 'test@test.com',
                role: UserRole.owner,
            },
            companyInfo: {
                companyId: 0,
                ownerId: 0,
                companyName: 'Personal',
                companyImageURL: "https://picsum.photos/seed/picsum/200/300",
            },
            friendsBlock: {
                iconName: 'person',
                text: 'Friends',
                number: 10
            },
            teamMatesBlock: {
                iconName: 'person.3.sequence',
                text: 'Team Mates',
                number: 0
            },
            requestsBlock: {
                iconName: "arrow.up.message",
                text: "Sended Requests",
                number: 1
            },
            onboardingBlock: {
                iconName: 'questionmark.bubble',
                text: 'Guide'
            }
        };
    }

    async saveDefaultCuppingSettings(
        dto: SaveDefaultCuppingSettingsRequestDto
    ): Promise<IStatusResponse> {
        return {
            status: StatusType.SUCCESS,
            description: "We save your data, thanks for your time"
        };
    }

    async getDefaultCuppingSettings(
        userId: number,
        currentCompanyId: number
    ): Promise<IGetDefaultCuppingSettingsResponse> {
        return {
            defaultCuppingName: "Cupping Name",
            randomSamplesOrder: true,
            openSampleNameCupping: false,
            singleUserCupping: false,
            inviteAllTeammates: true
        };
    }

    async getCompanyRules(
        userId: number,
        currentCompanyId: number
    ): Promise<IGetCompanyRulesResponse> {
        return {
            companyName: "Some Company",
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
        }
    }

    async saveCompanyRules(
        userId: number,
        currentCompanyId: number,
        dto: SaveCompanyRulesRequestDto
    ): Promise<StatusResponseDto> {
        return {
            status: StatusType.SUCCESS,
            description: "We saved all info"
        }
    }
}