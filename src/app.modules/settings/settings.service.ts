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
    ICompanyInfoResponse,
    IIconTextNumberInfoBlockResponse
} from './dto';
import { PrismaService } from 'src/app.services/prisma/prisma.service';
import { FriendshipType, Role, TeamInvitationType, User } from '@prisma/client';

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
            include: {
                currentCompany: {
                    include: { relatedToUsers: true, teamInvitations: true }
                },
                sentFriendships: true,
                receivedFriendships: true,
                sentTeamInvitations: true
            }
        });

        var currentCompany = user.currentCompany;
        // Fix for cases when change of company was with error
        if (!currentCompany) {
            const relation = await this.prisma.userToCompanyRelation.findFirst({
                where: { userId: userId },
                include: { company: { include: { relatedToUsers: true, teamInvitations: true } } }
            });

            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    currentCompany: { connect: { id: relation.company.id } },
                }
            });
            currentCompany = relation.company;
        }

        const teamInvitations = await this.prisma.teamInvitation.findMany({
            where: {
                OR: [
                    { companyId: currentCompany.id },
                    { type: TeamInvitationType.TEAM },
                ],
            }
        });

        const friendsCount = user.sentFriendships.filter((friendShip) => friendShip.type == FriendshipType.FRIEND).length
            + user.receivedFriendships.filter((friendShip) => friendShip.type == FriendshipType.FRIEND).length;

        const teamCount = currentCompany.teamInvitations.filter((invitations) => invitations.type == TeamInvitationType.TEAM).length;

        const requestsCount = user.sentFriendships.filter((friendShip) => friendShip.type == FriendshipType.REQUEST).length
            + user.sentTeamInvitations.filter((invitations) => invitations.type == TeamInvitationType.REQUEST).length;

        const mapCompany = (company: any): ICompanyInfoResponse => ({
            companyId: company.id,
            ownerId: company.relatedToUsers.find((relation) => relation.role === Role.OWNER).id,
            companyName: company.companyName, // Assumes this field exists in your DB
            companyImageURL: company.companyImageURL, // Optional: adjust if needed
        });

        const mapRole = (role: Role): UserRole => {
            switch (role) {
                case Role.OWNER:
                    return UserRole.owner;
                case Role.CHIEF:
                    return UserRole.chief;
                case Role.BARISTA:
                    return UserRole.barista;
                default:
                    throw new Error(`Unhandled role: ${role}`);
            }
        };

        const mapUser = (user: User): IUserInfoResponse => ({
            userId: user.id,
            userName: user.userName,
            userImageURL: user.userImageURL,
            email: user.email,
            role: mapRole(currentCompany.relatedToUsers.find((relation) => relation.userId == userId).role),
            about: user.about
        });

        const mapRequestsBlock = (number: number): IIconTextNumberInfoBlockResponse => ({
            iconName: "arrow.up.message",
            text: "Sended Requests",
            number: number
        })

        return {
            userInfo: mapUser(user),
            companyInfo: mapCompany(currentCompany),
            friendsBlock: {
                iconName: 'person',
                text: 'Friends',
                number: friendsCount
            },
            teamMatesBlock: {
                iconName: 'person.3.sequence',
                text: 'Team Mates',
                number: teamCount
            },
            ...(requestsCount ? { requestsBlock: mapRequestsBlock(requestsCount) } : {}),
            onboardingBlock: {
                iconName: 'questionmark.bubble',
                text: 'Guide'
            }
        };
    }

    // Will add when add cupping feature
    async saveDefaultCuppingSettings(
        dto: SaveDefaultCuppingSettingsRequestDto
    ): Promise<IStatusResponse> {
        return {
            status: StatusType.SUCCESS,
            description: "We save your data, thanks for your time"
        };
    }

    // Will add when add cupping feature
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
        // Get the company along with its rules
        const company = await this.prisma.company.findUnique({
            where: { id: currentCompanyId },
            include: { companyRules: true },
        });

        if (!company) {
            throw new Error("Company not found");
        }

        // Group the rules by the role
        const rulesForOwner = company.companyRules
            .filter(rule => rule.ruleForRole === Role.OWNER)
            .map(rule => ({ id: rule.id, name: rule.name, value: rule.value }));

        const rulesForChief = company.companyRules
            .filter(rule => rule.ruleForRole === Role.CHIEF)
            .map(rule => ({ id: rule.id, name: rule.name, value: rule.value }));

        const rulesForBarista = company.companyRules
            .filter(rule => rule.ruleForRole === Role.BARISTA)
            .map(rule => ({ id: rule.id, name: rule.name, value: rule.value }));

        return {
            companyName: company.companyName,
            rulesForOwner,
            rulesForChief,
            rulesForBarista
        };
    }

    async saveCompanyRules(
        userId: number,
        currentCompanyId: number,
        dto: SaveCompanyRulesRequestDto
    ): Promise<StatusResponseDto> {
        await this.prisma.$transaction(async (tx) => {
            for (const ruleDto of dto.rules) {
                await tx.companyRule.updateMany({
                    where: {
                        id: ruleDto.id,
                        companyId: currentCompanyId,
                    },
                    data: {
                        value: ruleDto.value,
                    },
                });
            }
        });

        return {
            status: StatusType.SUCCESS,
            description: `${dto.rules.length} company rules updated successfully`,
        };
    }
}