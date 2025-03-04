import { Injectable } from '@nestjs/common';
import {
    SaveDefaultCuppingSettingsRequestDto,
    IGetUserSettingsResponse,
    IStatusResponse,
    IGetDefaultCuppingSettingsResponse,
    StatusType,
    IGetCompanyRulesResponse,
    SaveCompanyRulesRequestDto,
    StatusResponseDto,
    IUserInfoResponse,
    UserRole,
    ICompanyInfoResponse
} from './dto';
import { PrismaService } from 'src/app.services/prisma/prisma.service';
import { Role, User } from '@prisma/client';

@Injectable()
export class SettingsService {
    constructor(
        private prisma: PrismaService,
    ) { }

    async getUserSettings(
        userId: number,
        currentCompanyId: number
    ): Promise<IGetUserSettingsResponse> {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            },
            include: { currentCompany: { include: { relatedToUsers: true } } }
        })

        var currentCompany = user.currentCompany;
        // Fix for cases when change of company was with error
        if (!currentCompany) {
            const relation = await this.prisma.userToCompanyRelation.findFirst({
                where: { userId: userId },
                include: { company: { include: { relatedToUsers: true } } }
            });

            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    currentCompany: { connect: { id: relation.company.id } },
                }
            });
            currentCompany = relation.company;
        }

        const mapCompany = (company: any): ICompanyInfoResponse => ({
            companyId: company.id,
            ownerId: company.relatedToUsers.find((relation) => relation.role === Role.OWNER).id,
            companyName: company.companyName, // Assumes this field exists in your DB
            companyImageURL: company.companyImageURL, // Optional: adjust if needed
        });

        const mapUser = (user: User): IUserInfoResponse => ({
            userId: user.id,
            userName: user.userName,
            userImageURL: user.userImageURL,
            email: user.email,
            role: UserRole.barista,
            about: user.about
        });

        return {
            userInfo: mapUser(user),
            companyInfo: mapCompany(currentCompany),
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