import { Inject, Injectable } from '@nestjs/common';
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
  IGetCurrentCuppingSettingsResponse,
} from './dto';
import { PrismaService } from 'src/app/common/services/prisma/prisma.service';
import {
  Company,
  Friendship,
  FriendshipType,
  Role,
  TeamInvitation,
  TeamInvitationType,
  User
} from '@prisma/client';
import { MappingService } from 'src/app/common/services/mapping.service';
import { ErrorHandlingService } from 'src/app/common/error-handling/error-handling.service';
import { IconsService } from 'src/app/common/services/icons/icons.service';
import { LocalizationStringsService } from 'src/app/common/localization/localization-strings.service';
import { SettingsKeys } from 'src/app/common/localization/generated/settings.enum';
import { IconKey } from 'src/app/common/services/icons/icon-keys.enum';
import {
  BusinessErrorKeys,
  ErrorsKeys
} from 'src/app/common/localization/generated';

@Injectable()
export class SettingsService {
  constructor(
    private prisma: PrismaService,
    private mappingService: MappingService,
    private errorHandlingService: ErrorHandlingService,
    private iconsService: IconsService,
    private localizationStringsService: LocalizationStringsService,
  ) { }

  async getUserSettings(
    userId: number,
    currentCompanyId: number
  ): Promise<IGetUserSettingsResponse> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          currentCompany: {
            include: { relatedToUsers: true, teamInvitations: true },
          },
          sentFriendships: true,
          receivedFriendships: true,
          sentTeamInvitations: true,
          receivedTeamInvitations: true,
        },
      });
      if (!user) {
        throw await this.errorHandlingService.getForbiddenError(
          ErrorsKeys.SESSION_EXPIRED
        );
      }

      const currentCompany = await this.resolveCurrentCompany(user, userId);
      const {
        friendsCount,
        teamCount,
        requestsCount,
        isUserHaveNewNotifications,
      } = await this.getCountsAndNotifications(user, currentCompany);

      // Get localized labels from settings.json via localization service.
      const friendsLabel = await this.localizationStringsService.getSettingsText(
        SettingsKeys.FRIENDS_LABEL
      );
      const teamMatesLabel =
        await this.localizationStringsService.getSettingsText(
          SettingsKeys.TEAMMATES_LABEL
        );
      const requestsLabel =
        await this.localizationStringsService.getSettingsText(
          SettingsKeys.REQUESTS_LABEL
        );
      const guideLabel = await this.localizationStringsService.getSettingsText(
        SettingsKeys.GUIDE_LABEL
      );

      // Map the user's role using the relation in the company.
      const userRelation = currentCompany.relatedToUsers.find(
        (rel) => rel.userId === userId
      );
      if (!userRelation) {
        throw await this.errorHandlingService.getBusinessError(
          BusinessErrorKeys.COMPANY_NOT_FOUND
        );
      }

      return {
        userInfo: this.mappingService.mapUser(
          user,
          this.mappingService.mapRole(userRelation.role)
        ),
        companyInfo: this.mappingService.mapCompany(currentCompany),
        friendsBlock: {
          iconName: await this.iconsService.getOSIcon(IconKey.user),
          text: friendsLabel,
          number: friendsCount,
        },
        teamMatesBlock: currentCompany.isPersonal
          ? null
          : {
            iconName: await this.iconsService.getOSIcon(IconKey.team),
            text: teamMatesLabel,
            number: teamCount,
          },
        ...(requestsCount
          ? {
            requestsBlock: {
              iconName: await this.iconsService.getOSIcon(IconKey.request),
              text: requestsLabel,
              number: requestsCount,
            } as IIconTextNumberInfoBlockResponse,
          }
          : {}),
        onboardingBlock: {
          iconName: await this.iconsService.getOSIcon(IconKey.guide),
          text: guideLabel,
        },
        isUserHaveNewNotifications,
      };
    } catch (error) {
      throw error;
    }
  }

  async saveDefaultCuppingSettings(
    userId: number,
    companyId: number,
    dto: SaveDefaultCuppingSettingsRequestDto
  ): Promise<IStatusResponse> {
    try {
      // First, verify that the company actually exists:
      const company = await this.prisma.company.findUnique({
        where: { id: companyId },
      });
      if (!company) {
        throw await this.errorHandlingService.getBusinessError(
          BusinessErrorKeys.COMPANY_NOT_FOUND
        );
      }

      // see if there’s any existing row:
      const existing = await this.prisma.defaultCuppingSettings.findFirst({
        where: { userId, companyId },
      });

      if (existing) {
        await this.prisma.defaultCuppingSettings.update({
          where: { id: existing.id },
          data: {
            defaultCuppingName: dto.defaultCuppingName,
            randomSamplesOrder: dto.randomSamplesOrder,
            openSampleNameCupping: dto.openSampleNameCupping,
            singleUserCupping: dto.singleUserCupping,
            inviteAllTeammates: dto.inviteAllTeammates,
          },
        });
      } else {
        await this.prisma.defaultCuppingSettings.create({
          data: {
            companyId,
            userId,
            defaultCuppingName: dto.defaultCuppingName,
            randomSamplesOrder: dto.randomSamplesOrder,
            openSampleNameCupping: dto.openSampleNameCupping,
            singleUserCupping: dto.singleUserCupping,
            inviteAllTeammates: dto.inviteAllTeammates,
          },
        });
      }

      const msg =
        await this.localizationStringsService.getSettingsText(
          SettingsKeys.DEFAULT_CUPPING_SETTINGS_SAVE_SUCCESS
        );
      return { status: StatusType.SUCCESS, description: msg };
    } catch (error) {
      throw error;
    }
  }

  async getDefaultCuppingSettings(
    userId: number,
    companyId: number
  ): Promise<IGetDefaultCuppingSettingsResponse> {
    try {
      const defaults =
        await this.prisma.defaultCuppingSettings.findFirst({
          where: { userId, companyId },
        });

      if (defaults) {
        return {
          defaultCuppingName: defaults.defaultCuppingName,
          randomSamplesOrder: defaults.randomSamplesOrder,
          openSampleNameCupping: defaults.openSampleNameCupping,
          singleUserCupping: defaults.singleUserCupping,
          inviteAllTeammates: defaults.inviteAllTeammates,
        };
      } else {
        return {
          defaultCuppingName:
            await this.localizationStringsService.getSettingsText(
              SettingsKeys.DEFAULT_CUPPING_NAME
            ),
          randomSamplesOrder: true,
          openSampleNameCupping: false,
          singleUserCupping: false,
          inviteAllTeammates: true,
        };
      }
    } catch (error) {
      throw error;
    }
  }

  async getCompanyRules(
    companyId: number
  ): Promise<IGetCompanyRulesResponse> {
    try {
      const company = await this.prisma.company.findUnique({
        where: { id: companyId },
        include: { companyRules: true },
      });

      if (!company) {
        throw await this.errorHandlingService.getBusinessError(
          BusinessErrorKeys.COMPANY_NOT_FOUND
        );
      }

      const rulesForOwner = company.companyRules
        .filter((rule) => rule.ruleForRole === Role.OWNER)
        .map((rule) => ({
          id: rule.id,
          name: rule.name,
          value: rule.value,
        }));

      const rulesForChief = company.companyRules
        .filter((rule) => rule.ruleForRole === Role.CHIEF)
        .map((rule) => ({
          id: rule.id,
          name: rule.name,
          value: rule.value,
        }));

      const rulesForBarista = company.companyRules
        .filter((rule) => rule.ruleForRole === Role.BARISTA)
        .map((rule) => ({
          id: rule.id,
          name: rule.name,
          value: rule.value,
        }));

      return {
        companyName: company.companyName,
        rulesForOwner,
        rulesForChief,
        rulesForBarista,
      };
    } catch (error) {
      throw error;
    }
  }

  async saveCompanyRules(
    dto: SaveCompanyRulesRequestDto
  ): Promise<StatusResponseDto> {
    try {
      // Check that the company exists before updating any rules
      const company = await this.prisma.company.findUnique({
        where: { id: dto.companyId },
      });
      if (!company) {
        throw await this.errorHandlingService.getBusinessError(
          BusinessErrorKeys.COMPANY_NOT_FOUND
        );
      }

      await this.prisma.$transaction(async (tx) => {
        for (const ruleDto of dto.rules) {
          const updated = await tx.companyRule.updateMany({
            where: {
              id: ruleDto.id,
              companyId: dto.companyId,
            },
            data: { value: ruleDto.value },
          });

          // If no rows were updated, it means the `id` was invalid for this company:
          if (updated.count === 0) {
            throw await this.errorHandlingService.getBusinessError(
              BusinessErrorKeys.VALIDATION_ERROR,
              // we could pass a specific validation error key here if desired
              { property: `"rule id ${ruleDto.id}"`, message: `"rule not found or mismatched company"` }
            );
          }
        }
      });

      const rulesUpdatedMsg =
        await this.localizationStringsService.getSettingsText(
          SettingsKeys.COMPANY_RULES_SAVE_SUCCESS
        );
      return {
        status: StatusType.SUCCESS,
        description: `${dto.rules.length} ${rulesUpdatedMsg}`,
      };
    } catch (error) {
      throw error;
    }
  }

  async getCurrentCuppingSettings(
    userId: number,
    currentCompanyId: number
  ): Promise<IGetCurrentCuppingSettingsResponse> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          currentCompany: {
            include: { relatedToUsers: true, teamInvitations: true },
          },
        },
      });
      if (!user) {
        throw await this.errorHandlingService.getForbiddenError(
          ErrorsKeys.SESSION_EXPIRED
        );
      }

      const currentCompany = await this.resolveCurrentCompany(user, userId);

      const teamCount =
        currentCompany.teamInvitations.filter(
          (inv) => inv.type === TeamInvitationType.TEAM
        ).length + 1;

      const cuppingNumber = await this.prisma.cupping.findMany({
        where: { companyId: currentCompanyId },
      });

      return {
        cuppingNumber: `${cuppingNumber.length + 1}`,
        chosenUsersAmount: teamCount,
      };
    } catch (error) {
      throw error;
    }
  }

  // MARK: - Private Methods

  /**
   * Resolves the current company for the user. If no current company exists,
   * it attempts to get one via the user's company relation.
   */
  private async resolveCurrentCompany(user: any, userId: number): Promise<any> {
    if (user.currentCompany) return user.currentCompany;

    const relation = await this.prisma.userToCompanyRelation.findFirst({
      where: { userId },
      include: { company: { include: { relatedToUsers: true, teamInvitations: true } } },
    });
    if (!relation) {
      throw await this.errorHandlingService.getBusinessError(
        BusinessErrorKeys.COMPANY_NOT_FOUND
      );
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { currentCompany: { connect: { id: relation.company.id } } },
    });
    return relation.company;
  }

  /**
   * Computes counts for friends, team mates, requests and checks for new notifications.
   */
  private async getCountsAndNotifications(
    user: User & {
      sentFriendships: Friendship[],
      receivedFriendships: Friendship[],
      sentTeamInvitations: TeamInvitation[],
      receivedTeamInvitations: TeamInvitation[]
    },
    company: Company & {
      teamInvitations: TeamInvitation[]
    }
  ): Promise<{
    friendsCount: number;
    teamCount: number;
    requestsCount: number;
    isUserHaveNewNotifications: boolean;
  }> {
    const friendsCount: number =
      user.sentFriendships.filter(
        (fs) => fs.type === FriendshipType.FRIEND
      ).length +
      user.receivedFriendships.filter(
        (fs) => fs.type === FriendshipType.FRIEND
      ).length;

    const teamCount = company.teamInvitations.filter(
      (inv) => inv.type === TeamInvitationType.TEAM
    ).length;

    const requestsCount =
      user.sentFriendships.filter(
        (fs) => fs.type === FriendshipType.REQUEST
      ).length +
      user.sentTeamInvitations.filter(
        (ti) => ti.type === TeamInvitationType.REQUEST
      ).length;

    const isUserHaveNewNotifications: boolean =
      user.receivedFriendships.some(
        (req) => req.wasLoadedByReceiver === false
      ) ||
      user.receivedTeamInvitations.some(
        (req) => req.wasLoadedByReceiver === false
      );

    return { friendsCount, teamCount, requestsCount, isUserHaveNewNotifications };
  }
}