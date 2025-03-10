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
  IIconTextNumberInfoBlockResponse,
} from './dto';
import { PrismaService } from 'src/app.services/prisma/prisma.service';
import { FriendshipType, Role, TeamInvitationType, User } from '@prisma/client';
import { MappingService } from 'src/app.common/services/mapping.service';

@Injectable()
export class SettingsService {
  constructor(
    private prisma: PrismaService,
    private mappingService: MappingService,
  ) { }

  async getUserSettings(
    userId: number,
    currentCompanyId: number
  ): Promise<IGetUserSettingsResponse> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        currentCompany: {
          include: { relatedToUsers: true, teamInvitations: true },
        },
        sentFriendships: true,
        receivedFriendships: true,
        sentTeamInvitations: true,
        receivedTeamInvitations: true
      },
    });

    let currentCompany = user.currentCompany;
    if (!currentCompany) {
      const relation = await this.prisma.userToCompanyRelation.findFirst({
        where: { userId: userId },
        include: { company: { include: { relatedToUsers: true, teamInvitations: true } } },
      });

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          currentCompany: { connect: { id: relation.company.id } },
        },
      });
      currentCompany = relation.company;
    }

    const teamInvitations = await this.prisma.teamInvitation.findMany({
      where: {
        OR: [
          { companyId: currentCompany.id },
          { type: TeamInvitationType.TEAM },
        ],
      },
    });

    const friendsCount =
      user.sentFriendships.filter((friendShip) => friendShip.type == FriendshipType.FRIEND).length +
      user.receivedFriendships.filter((friendShip) => friendShip.type == FriendshipType.FRIEND).length;

    const teamCount = currentCompany.teamInvitations.filter((invitations) => invitations.type == TeamInvitationType.TEAM).length;

    const requestsCount =
      user.sentFriendships.filter((friendShip) => friendShip.type == FriendshipType.REQUEST).length +
      user.sentTeamInvitations.filter((invitations) => invitations.type == TeamInvitationType.REQUEST).length;

    const isUserHaveNewNotifications: boolean = user.receivedFriendships.some(request => request.wasLoadedByReceiver === false) 
    || user.receivedTeamInvitations.some(request => request.wasLoadedByReceiver === false)

    return {
      userInfo: this.mappingService.mapUser(
        user,
        this.mappingService.mapRole(
          currentCompany.relatedToUsers.find((relation) => relation.userId == userId).role,
        ),
      ),
      companyInfo: this.mappingService.mapCompany(currentCompany),
      friendsBlock: {
        iconName: 'person',
        text: 'Friends',
        number: friendsCount,
      },
      teamMatesBlock: {
        iconName: 'person.3.sequence',
        text: 'Team Mates',
        number: teamCount,
      },
      ...(
        requestsCount
          ? {
            requestsBlock: {
              iconName: 'arrow.up.message',
              text: 'Sended Requests',
              number: requestsCount,
            } as IIconTextNumberInfoBlockResponse,
          }
          : {}
      ),
      onboardingBlock: {
        iconName: 'questionmark.bubble',
        text: 'Guide',
      },
      isUserHaveNewNotifications
    };
  }

  async saveDefaultCuppingSettings(
    dto: SaveDefaultCuppingSettingsRequestDto
  ): Promise<IStatusResponse> {
    return {
      status: StatusType.SUCCESS,
      description: "We save your data, thanks for your time",
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
      inviteAllTeammates: true,
    };
  }

  async getCompanyRules(
    companyId: number
  ): Promise<IGetCompanyRulesResponse> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: { companyRules: true },
    });

    if (!company) {
      throw new Error("Company not found");
    }

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
      rulesForBarista,
    };
  }

  async saveCompanyRules(
    dto: SaveCompanyRulesRequestDto
  ): Promise<StatusResponseDto> {
    await this.prisma.$transaction(async (tx) => {
      for (const ruleDto of dto.rules) {
        await tx.companyRule.updateMany({
          where: {
            id: ruleDto.id,
            companyId: dto.companyId,
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