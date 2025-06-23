import { Injectable, HttpException } from '@nestjs/common';
import { PrismaService } from 'src/app/common/services/prisma/prisma.service';
import {
  IStatusResponse,
  SearchUserType,
  UserActionType,
  StatusType,
  StatusResponseDto,
  SearchUsersRequestDto,
  ISearchUsersResponse,
  IGetUserCardResponse,
  GetUserCardRequestDto,
  IGetUserNotificationsResponse,
  IGetUserSendedRequestsResponse,
  MakeUserActionRequest,
  SaveEditUserRequest,
  IUserInfoResponse,
  RequestTypeEnum,
  RejectUserSendedRequestRequest,
  IGetUserAction,
  IGetUserSendedRequestResponse,
  OTPRequestDto,
  IGetUserNotificationResponse,
} from './dto';
import {
  Friendship,
  TeamInvitation,
  Role as PrismaRole,
  Role,
  FriendshipType,
  TeamInvitationType,
  CuppingInvitation,
  Cupping,
} from '@prisma/client';
import { MappingService } from 'src/app/common/services/mapping.service';
import { CompanyRulesService } from 'src/app/common/services/company-rules.service';
import { ErrorHandlingService } from 'src/app/common/error-handling/error-handling.service';
import { LocalizationStringsService } from 'src/app/common/localization/localization-strings.service';
import { UserKeys } from 'src/app/common/localization/generated/user.enum';
import { MailService } from 'src/app/common/services/mail/mail.service';
import * as argon from 'argon2';
import { ConfigurationService } from 'src/app/common/services/config/configuration.service';
import { IconsService } from 'src/app/common/services/icons/icons.service';
import { IconKey } from 'src/app/common/services/icons/icon-keys.enum';
import { BusinessErrorKeys, CuppingKeys } from 'src/app/common/localization/generated';
import { UserRole } from 'src/app/common/dto';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private mappingService: MappingService,
    private companyRulesService: CompanyRulesService,
    private errorHandlingService: ErrorHandlingService,
    private localizationStringsService: LocalizationStringsService,
    private mailService: MailService,
    private configService: ConfigurationService,
    private iconsService: IconsService
  ) { }

  async searchUsers(
    userId: number,
    currentCompanyId: number,
    dto: SearchUsersRequestDto,
  ): Promise<ISearchUsersResponse> {
    try {
      switch (dto.type) {
        case SearchUserType.friendsList:
          return await this.searchFriends(userId, dto);

        case SearchUserType.teamList:
          return await this.searchTeam(userId, currentCompanyId, dto);

        case SearchUserType.friendsGlobalSearch:
          return await this.searchGlobal(userId, dto);

        default:
          // If somehow dto.type is invalid, return empty result rather than letting everything crash
          return { users: [] };
      }
    } catch (error) {
      throw error;
    }
  }

  async getUsersList(
    userId: number,
    currentCompanyId: number,
    type: SearchUserType,
  ): Promise<ISearchUsersResponse> {
    try {
      switch (type) {
        case SearchUserType.friendsList:
          return await this.getFriendsList(userId);

        case SearchUserType.teamList:
          return await this.getTeamList(userId, currentCompanyId);

        case SearchUserType.friendsGlobalSearch:
          return { users: [] };

        default:
          return { users: [] };
      }
    } catch (error) {
      throw error;
    }
  }

  async getUserCard(
    userId: number,
    currentCompanyId: number,
    dto: GetUserCardRequestDto,
  ): Promise<IGetUserCardResponse> {
    try {
      const targetUser = await this.prisma.user.findUnique({ where: { id: dto.userId } });
      if (!targetUser) {
        throw await this.errorHandlingService.getBusinessError(
          BusinessErrorKeys.USER_DOESNT_EXIST,
        );
      }

      const userInfo = this.mappingService.mapUser(targetUser);
      const actions = await this.buildUserActions(userId, currentCompanyId, dto.userId);
      const status = await this.buildUserStatus(userId, currentCompanyId, dto.userId);
      return {
        userInfo,
        status,
        actions
      };
    } catch (error) {
      throw error;
    }
  }

  async getUserInfo(userId: number): Promise<IUserInfoResponse> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw await this.errorHandlingService.getBusinessError(
          BusinessErrorKeys.USER_DOESNT_EXIST,
        );
      }
      return this.mappingService.mapUser(user);
    } catch (error) {
      throw error;
    }
  }

  async getUserSendedRequests(
    userId: number,
    currentCompanyId: number,
  ): Promise<IGetUserSendedRequestsResponse> {
    try {
      const friendRequests = await this.prisma.friendship.findMany({
        where: { senderId: userId, type: FriendshipType.REQUEST },
      });
      const teamRequests = await this.prisma.teamInvitation.findMany({
        where: { senderId: userId, type: TeamInvitationType.REQUEST },
      });

      const requests: IGetUserSendedRequestResponse[] = [];

      for (const req of friendRequests) {
        const targetUser = await this.prisma.user.findUnique({
          where: { id: req.receiverId },
        });
        if (targetUser) {
          requests.push(
            this.mappingService.mapFriendRequest(
              req,
              await this.localizationStringsService.getUserText(
                UserKeys.FRIEND_REQUEST_TO,
                { userName: targetUser.userName },
              ),
            ),
          );
        }
      }

      for (const req of teamRequests) {
        const targetUser = await this.prisma.user.findUnique({
          where: { id: req.receiverId },
        });
        if (targetUser) {
          requests.push(
            this.mappingService.mapTeamInvitation(
              req,
              await this.localizationStringsService.getUserText(
                UserKeys.TEAM_INVITATION_TO,
                { userName: targetUser.userName },
              ),
            ),
          );
        }
      }

      return { requests };
    } catch (error) {
      throw error;
    }
  }

  async getUserNotifications(
    userId: number,
    currentCompanyId: number,
  ): Promise<IGetUserNotificationsResponse> {
    try {
      const friendRequests = await this.prisma.friendship.findMany({
        where: { receiverId: userId, type: FriendshipType.REQUEST },
      });
      const teamInvitations = await this.prisma.teamInvitation.findMany({
        where: { receiverId: userId, type: TeamInvitationType.REQUEST },
      });
      const cuppingInvitations = (await this.prisma.cuppingInvitation.findMany({
        where: { userId },
        include: { cupping: true },
      })) as Array<CuppingInvitation & { cupping: Cupping }>;

      const notifications = await this.buildNotifications(
        friendRequests,
        teamInvitations,
        cuppingInvitations,
      );
      return { notifications };
    } catch (error) {
      throw error;
    }
  }

  async makeUserAction(
    userId: number,
    currentCompanyId: number,
    dto: MakeUserActionRequest,
  ): Promise<IStatusResponse> {
    try {
      switch (dto.type) {
        case UserActionType.addToFriends:
          return await this.handleAddToFriends(userId, dto);

        case UserActionType.removeFromFriends:
          return await this.handleRemoveFromFriends(userId, dto);

        case UserActionType.addToTeam:
          return await this.handleAddToTeam(userId, currentCompanyId, dto);

        case UserActionType.removeFromTeam:
          return await this.handleRemoveFromTeam(userId, dto);

        case UserActionType.makeChief:
          return await this.handleMakeChief(currentCompanyId, dto);

        case UserActionType.acceptFriendRequest:
          return await this.handleAcceptFriendRequest(userId, dto);

        case UserActionType.acceptTeamRequest:
          return await this.handleAcceptTeamRequest(userId, currentCompanyId, dto);

        default:
          return {
            status: StatusType.DENIED,
            description: await this.localizationStringsService.getUserText(
              UserKeys.INVALID_ACTION,
            ),
          };
      }
    } catch (error) {
      throw error;
    }
  }

  async rejectUserSendedRequest(
    userId: number,
    currentCompanyId: number,
    dto: RejectUserSendedRequestRequest,
  ): Promise<IStatusResponse> {
    try {
      if (dto.requestType === RequestTypeEnum.FRIEND) {
        const result = await this.prisma.friendship.deleteMany({
          where: {
            id: dto.requestId,
            senderId: userId,
            type: FriendshipType.REQUEST,
          },
        });
        if (result.count > 0) {
          return {
            status: StatusType.SUCCESS,
            description: await this.localizationStringsService.getUserText(
              UserKeys.FRIEND_REMOVED,
            ),
          };
        }
      } else if (dto.requestType === RequestTypeEnum.TEAM) {
        const result = await this.prisma.teamInvitation.deleteMany({
          where: {
            id: dto.requestId,
            senderId: userId,
            type: TeamInvitationType.REQUEST,
          },
        });
        if (result.count > 0) {
          return {
            status: StatusType.SUCCESS,
            description: await this.localizationStringsService.getUserText(
              UserKeys.TEAM_INVITATION_CANCELLED,
            ),
          };
        }
      }

      return {
        status: StatusType.DENIED,
        description: await this.localizationStringsService.getUserText(
          UserKeys.REQUEST_NOT_FOUND,
        ),
      };
    } catch (error) {
      throw error;
    }
  }

  async saveEditUser(
    userId: number,
    dto: SaveEditUserRequest,
  ): Promise<StatusResponseDto> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw await this.errorHandlingService.getBusinessError(
          BusinessErrorKeys.USER_DOESNT_EXIST,
        );
      }

      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { userName: dto.userName, about: dto.about },
      });

      if (dto.email && dto.email !== user.email) {
        await this.confirmEmailChange(userId, dto.email);
        return {
          status: StatusType.SUCCESS,
          description: await this.localizationStringsService.getUserText(
            UserKeys.OTP_SENT_FOR_EMAIL_CHANGE,
          ),
        };
      }

      return {
        status: StatusType.SUCCESS,
        description: await this.localizationStringsService.getUserText(
          UserKeys.USER_INFO_UPDATED,
        ),
      };
    } catch (error) {
      throw error;
    }
  }

  async verifyNewEmail(
    userId: number,
    dto: OTPRequestDto,
  ): Promise<StatusResponseDto> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw await this.errorHandlingService.getBusinessError(
          BusinessErrorKeys.USER_DOESNT_EXIST,
        );
      }

      const isOtpValid = await argon.verify(user.otpHash, dto.otp);
      if (!isOtpValid) {
        return {
          status: StatusType.DENIED,
          description: await this.localizationStringsService.getUserText(
            UserKeys.INCORRECT_OTP,
          ),
        };
      }

      await this.prisma.user.update({
        where: { id: userId },
        data: { email: dto.email, otpHash: null },
      });

      return {
        status: StatusType.SUCCESS,
        description: await this.localizationStringsService.getUserText(
          UserKeys.EMAIL_UPDATED,
        ),
      };
    } catch (error) {
      throw error;
    }
  }

  async resendNewEmailOTP(
    userId: number,
    newEmail: string,
  ): Promise<StatusResponseDto> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw await this.errorHandlingService.getBusinessError(
          BusinessErrorKeys.USER_DOESNT_EXIST,
        );
      }

      const { otp, hashedOtp } = await this.generateOtp();
      await this.prisma.user.update({
        where: { id: userId },
        data: { otpHash: hashedOtp },
      });
      await this.sendOtp(user.email, newEmail, otp);

      return {
        status: StatusType.SUCCESS,
        description: await this.localizationStringsService.getUserText(
          UserKeys.OTP_RESENT,
        ),
      };
    } catch (error) {
      throw error;
    }
  }

  // MARK: - Private Methods

  private async searchFriends(
    userId: number,
    dto: SearchUsersRequestDto,
  ): Promise<ISearchUsersResponse> {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [
          { senderId: userId, type: FriendshipType.FRIEND },
          { receiverId: userId, type: FriendshipType.FRIEND },
        ],
      },
    });
    const friendIds = friendships.map((fs) =>
      fs.senderId === userId ? fs.receiverId : fs.senderId,
    );
    const users = await this.prisma.user.findMany({
      where: {
        id: { in: friendIds },
        OR: [
          { userName: { contains: dto.searchStr, mode: 'insensitive' } },
          { email: { contains: dto.searchStr, mode: 'insensitive' } },
        ],
      },
    });
    return { users: users.map((user) => this.mappingService.mapUser(user)) };
  }

  private async searchTeam(
    currentUserId: number,
    currentCompanyId: number,
    dto: SearchUsersRequestDto,
  ): Promise<ISearchUsersResponse> {
    const relations = await this.prisma.userToCompanyRelation.findMany({
      where: { companyId: currentCompanyId },
      include: { user: true },
    });
    const filteredUsers = relations
      .map((relation) => relation.user)
      .filter((user) => {
        if (user.id === currentUserId) {
          return false;
        } else if (!dto.searchStr) {
          return true;
        }
        const searchLower = dto.searchStr.toLowerCase();
        return (
          (user.userName && user.userName.toLowerCase().includes(searchLower)) ||
          (user.email && user.email.toLowerCase().includes(searchLower))
        );
      });
    return { users: filteredUsers.map((user) => this.mappingService.mapUser(user)) };
  }

  private async searchGlobal(
    userId: number,
    dto: SearchUsersRequestDto,
  ): Promise<ISearchUsersResponse> {
    const users = await this.prisma.user.findMany({
      where: {
        id: { not: userId },
        OR: [
          { userName: { contains: dto.searchStr, mode: 'insensitive' } },
          { email: { contains: dto.searchStr, mode: 'insensitive' } },
        ],
      },
    });
    return { users: users.map((user) => this.mappingService.mapUser(user)) };
  }

  private async getFriendsList(userId: number): Promise<ISearchUsersResponse> {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [
          { senderId: userId, type: FriendshipType.FRIEND },
          { receiverId: userId, type: FriendshipType.FRIEND },
        ],
      },
    });
    const friendIds = friendships.map((fs) =>
      fs.senderId === userId ? fs.receiverId : fs.senderId,
    );
    const users = await this.prisma.user.findMany({
      where: { id: { in: friendIds } },
    });
    return { users: users.map((user) => this.mappingService.mapUser(user)) };
  }

  private async getTeamList(
    userId: number,
    currentCompanyId: number,
  ): Promise<ISearchUsersResponse> {
    const relations = await this.prisma.userToCompanyRelation.findMany({
      where: { companyId: currentCompanyId, userId: { not: userId } },
      include: { user: true },
    });

    const users: IUserInfoResponse[] = [];
    relations.forEach((relation) => {
      const role = this.mappingService.mapRole(relation.role);
      const user = this.mappingService.mapUser(relation.user, role);
      users.push(user);
    });

    return { users };
  }

  private async buildUserActions(
    currentUserId: number,
    currentCompanyId: number,
    targetUserId: number,
  ): Promise<IGetUserAction[]> {
    const currentUser = await this.prisma.user.findUnique({
      where: { id: currentUserId },
      include: { currentCompany: true, relatedToCompanies: true },
    });
    const actions: IGetUserAction[] = [];
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: currentUserId },
        ],
      },
    });
    const teamInvitation = await this.prisma.teamInvitation.findFirst({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: currentUserId },
        ],
      },
    });
    const targetUserRelation = await this.prisma.userToCompanyRelation.findFirst({
      where: { userId: targetUserId, companyId: currentCompanyId },
    });

    const isFriend = friendship ? friendship.type === FriendshipType.FRIEND : false;
    const isIncomingFriendRequest = friendship
      ? friendship.type === FriendshipType.REQUEST
      : false;
    const isTeammate = !!targetUserRelation;
    const isIncomingTeamRequest = teamInvitation
      ? teamInvitation.type === TeamInvitationType.REQUEST
      : false;
    const isCompanyPersonal = currentUser.currentCompany?.isPersonal;

    const userRole = currentUser.relatedToCompanies.find((relation) => relation.companyId == currentCompanyId).role
    const showMakeChief = await this.companyRulesService.shouldShowMakeChiefAction(
      currentCompanyId,
    ) || (userRole == Role.OWNER && isTeammate);

    const isNotCurrentUser = currentUserId != targetUserId

    actions.push({
      type: UserActionType.addToFriends,
      title: await this.localizationStringsService.getUserText(
        UserKeys.ADD_TO_FRIENDS,
      ),
      isEnabled: !isFriend && !isIncomingFriendRequest && isNotCurrentUser,
    });
    actions.push({
      type: UserActionType.removeFromFriends,
      title: await this.localizationStringsService.getUserText(
        UserKeys.REMOVE_FROM_FRIENDS,
      ),
      isEnabled: isFriend && isNotCurrentUser,
    });
    actions.push({
      type: UserActionType.addToTeam,
      title: await this.localizationStringsService.getUserText(
        UserKeys.ADD_TO_TEAM,
      ),
      isEnabled: !isTeammate && !isIncomingTeamRequest && !isCompanyPersonal && isNotCurrentUser,
    });
    actions.push({
      type: UserActionType.removeFromTeam,
      title: await this.localizationStringsService.getUserText(
        UserKeys.REMOVE_FROM_TEAM,
      ),
      isEnabled: isTeammate && !isCompanyPersonal && isNotCurrentUser,
    });
    if (showMakeChief && !isCompanyPersonal) {
      actions.push({
        type: UserActionType.makeChief,
        title: await this.localizationStringsService.getUserText(
          UserKeys.MAKE_CHIEF,
        ),
        isEnabled: true,
        switchIsOn: !(targetUserRelation?.role === Role.CHIEF),
      });
    }
    if (isIncomingFriendRequest) {
      actions.push({
        type: UserActionType.acceptFriendRequest,
        title: await this.localizationStringsService.getUserText(
          UserKeys.ACCEPT_FRIEND_REQUEST,
        ),
        isEnabled: true,
      });
    }
    if (isIncomingTeamRequest && !isCompanyPersonal) {
      actions.push({
        type: UserActionType.acceptTeamRequest,
        title: await this.localizationStringsService.getUserText(
          UserKeys.ACCEPT_TEAM_REQUEST,
        ),
        isEnabled: true,
      });
    }

    return actions;
  }

  private async buildUserStatus(
    currentUserId: number,
    currentCompanyId: number,
    targetUserId: number,
  ): Promise<string> {
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: currentUserId },
        ],
      },
    });
    const targetUserRelation = await this.prisma.userToCompanyRelation.findFirst({
      where: { userId: targetUserId, companyId: currentCompanyId },
    });
    const isFriend = friendship ? friendship.type === FriendshipType.FRIEND : false;
    const isTeammate = !!targetUserRelation;
    let status = await this.localizationStringsService.getUserText(
      UserKeys.STRANGER,
    );
    if (isFriend && isTeammate) {
      status = await this.localizationStringsService.getUserText(
        UserKeys.FRIENDS_TEAMMATES,
      );
    } else if (isFriend) {
      status = await this.localizationStringsService.getUserText(
        UserKeys.FRIENDS,
      );
    } else if (isTeammate) {
      status = await this.localizationStringsService.getUserText(
        UserKeys.TEAMMATES,
      );
    }
    return status;
  }

  private async buildNotifications(
    friendRequests: Friendship[],
    teamInvitations: TeamInvitation[],
    cuppingInvitations: Array<CuppingInvitation & { cupping: Cupping }>,
  ): Promise<IGetUserNotificationResponse[]> {
    const notifications: IGetUserNotificationResponse[] = [];

    for (const req of friendRequests) {
      const sender = await this.prisma.user.findUnique({
        where: { id: req.senderId },
      });
      if (sender) {
        notifications.push(
          this.mappingService.mapFriendRequestNotification(
            req,
            sender,
            await this.iconsService.getOSIcon(IconKey.user),
            await this.localizationStringsService.getUserText(
              UserKeys.FRIEND_REQUEST_FROM,
              { userName: sender.userName },
            ),
          ),
        );
      }
    }

    for (const req of teamInvitations) {
      const sender = await this.prisma.user.findUnique({
        where: { id: req.senderId },
      });
      if (sender) {
        notifications.push(
          this.mappingService.mapTeamInvitationNotification(
            req,
            sender,
            await this.iconsService.getOSIcon(IconKey.team_invitation),
            await this.localizationStringsService.getUserText(
              UserKeys.TEAM_INVITATION_FROM,
              { userName: sender.userName },
            ),
          ),
        );
      }
    }

    for (const inv of cuppingInvitations) {
      notifications.push(
        this.mappingService.mapCuppingInvitationNotification(
          inv,
          inv.cupping,
          await this.iconsService.getOSIcon(IconKey.cupping_invitation),
          await this.localizationStringsService.getCuppingText(
            CuppingKeys.CUPPING_INVITATION,
            { cuppingName: inv.cupping.cuppingName },
          ),
        ),
      );
    }

    notifications.sort((a, b) =>
      a.notificationDate < b.notificationDate ? 1 : -1,
    );

    // Mark them as “loaded” all at once
    await Promise.all([
      ...friendRequests.map((request) =>
        this.prisma.friendship.update({
          where: { id: request.id },
          data: { wasLoadedByReceiver: true },
        }),
      ),
      ...teamInvitations.map((request) =>
        this.prisma.teamInvitation.update({
          where: { id: request.id },
          data: { wasLoadedByReceiver: true },
        }),
      ),
      ...cuppingInvitations.map((ci) =>
        this.prisma.cuppingInvitation.update({
          where: { id: ci.id },
          data: { wasLoadedByReceiver: true },
        }),
      ),
    ]);

    return notifications;
  }

  private async handleAddToFriends(
    userId: number,
    dto: MakeUserActionRequest,
  ): Promise<IStatusResponse> {
    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId: dto.userId },
          { senderId: dto.userId, receiverId: userId },
        ],
      },
    });

    if (existing) {
      if (existing.type !== FriendshipType.FRIEND) {
        await this.prisma.friendship.updateMany({
          where: {
            OR: [
              { senderId: userId, receiverId: dto.userId },
              { senderId: dto.userId, receiverId: userId },
            ],
          },
          data: { type: FriendshipType.REQUEST },
        });
      } else {
        return {
          status: StatusType.DENIED,
          description: await this.localizationStringsService.getUserText(
            UserKeys.FRIEND_REQUEST_SENT,
          ),
        };
      }
    } else {
      await this.prisma.friendship.create({
        data: {
          senderId: userId,
          receiverId: dto.userId,
          type: FriendshipType.REQUEST,
        },
      });
    }

    return {
      status: StatusType.SUCCESS,
      description: await this.localizationStringsService.getUserText(
        UserKeys.FRIEND_REQUEST_SENT,
      ),
    };
  }

  private async handleRemoveFromFriends(
    userId: number,
    dto: MakeUserActionRequest,
  ): Promise<IStatusResponse> {
    await this.prisma.friendship.updateMany({
      where: {
        OR: [
          { senderId: userId, receiverId: dto.userId },
          { senderId: dto.userId, receiverId: userId },
        ],
      },
      data: { type: FriendshipType.ENDED },
    });
    return {
      status: StatusType.SUCCESS,
      description: await this.localizationStringsService.getUserText(
        UserKeys.FRIEND_REMOVED,
      ),
    };
  }

  private async handleAddToTeam(
    userId: number,
    currentCompanyId: number,
    dto: MakeUserActionRequest,
  ): Promise<IStatusResponse> {
    const existing = await this.prisma.teamInvitation.findFirst({
      where: {
        senderId: userId,
        receiverId: dto.userId,
        type: TeamInvitationType.REQUEST,
      },
    });
    if (existing) {
      return {
        status: StatusType.DENIED,
        description: await this.localizationStringsService.getUserText(
          UserKeys.TEAM_INVITATION_ALREADY_SENT,
        ),
      };
    }
    await this.prisma.teamInvitation.create({
      data: {
        companyId: currentCompanyId,
        senderId: userId,
        receiverId: dto.userId,
        type: TeamInvitationType.REQUEST,
      },
    });
    return {
      status: StatusType.SUCCESS,
      description: await this.localizationStringsService.getUserText(
        UserKeys.TEAM_INVITATION_SENT,
      ),
    };
  }

  private async handleRemoveFromTeam(
    userId: number,
    dto: MakeUserActionRequest,
  ): Promise<IStatusResponse> {
    await this.prisma.teamInvitation.deleteMany({
      where: {
        senderId: userId,
        receiverId: dto.userId,
        type: TeamInvitationType.TEAM,
      },
    });
    return {
      status: StatusType.SUCCESS,
      description: await this.localizationStringsService.getUserText(
        UserKeys.REMOVED_FROM_TEAM,
      ),
    };
  }

  private async handleMakeChief(
    currentCompanyId: number,
    dto: MakeUserActionRequest,
  ): Promise<IStatusResponse> {
    await this.prisma.userToCompanyRelation.updateMany({
      where: { userId: dto.userId, companyId: currentCompanyId },
      data: { role: PrismaRole.CHIEF },
    });
    return {
      status: StatusType.SUCCESS,
      description: await this.localizationStringsService.getUserText(
        UserKeys.USER_NOW_CHIEF,
      ),
    };
  }

  private async handleAcceptFriendRequest(
    userId: number,
    dto: MakeUserActionRequest,
  ): Promise<IStatusResponse> {
    const existingRequest = await this.prisma.friendship.findFirst({
      where: {
        senderId: dto.userId,
        receiverId: userId,
        type: FriendshipType.REQUEST,
      },
    });
    if (!existingRequest) {
      return {
        status: StatusType.DENIED,
        description: await this.localizationStringsService.getUserText(
          UserKeys.NO_FRIEND_REQUEST,
        ),
      };
    }
    await this.prisma.friendship.update({
      where: { id: existingRequest.id },
      data: { type: FriendshipType.FRIEND },
    });
    return {
      status: StatusType.SUCCESS,
      description: await this.localizationStringsService.getUserText(
        UserKeys.FRIEND_REQUEST_ACCEPTED,
      ),
    };
  }

  private async handleAcceptTeamRequest(
    userId: number,
    currentCompanyId: number,
    dto: MakeUserActionRequest,
  ): Promise<IStatusResponse> {
    const existingInvitation = await this.prisma.teamInvitation.findFirst({
      where: {
        senderId: dto.userId,
        receiverId: userId,
        companyId: currentCompanyId,
        type: TeamInvitationType.REQUEST,
      },
    });
    if (!existingInvitation) {
      return {
        status: StatusType.DENIED,
        description: await this.localizationStringsService.getUserText(
          UserKeys.NO_TEAM_INVITATION,
        ),
      };
    }

    await this.prisma.teamInvitation.update({
      where: { id: existingInvitation.id },
      data: { type: TeamInvitationType.TEAM },
    });

    const existingRelation = await this.prisma.userToCompanyRelation.findFirst({
      where: {
        userId: userId,
        companyId: existingInvitation.companyId,
      },
    });
    if (!existingRelation) {
      await this.prisma.userToCompanyRelation.create({
        data: {
          userId: userId,
          companyId: existingInvitation.companyId,
          role: PrismaRole.BARISTA,
        },
      });
    }

    return {
      status: StatusType.SUCCESS,
      description: await this.localizationStringsService.getUserText(
        UserKeys.TEAM_INVITATION_ACCEPTED,
      ),
    };
  }

  private async confirmEmailChange(
    userId: number,
    newEmail: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw await this.errorHandlingService.getBusinessError(
        BusinessErrorKeys.USER_DOESNT_EXIST,
      );
    }
    const { otp, hashedOtp } = await this.generateOtp();
    await this.prisma.user.update({
      where: { id: userId },
      data: { otpHash: hashedOtp },
    });
    await this.sendOtp(user.email, newEmail, otp);
  }

  private async sendOtp(
    currentEmail: string,
    newEmail: string,
    otp: string,
  ): Promise<void> {
    if (this.configService.getEnv() !== 'development') {
      await this.mailService.sendOtpToUpdateEmail(currentEmail, newEmail, otp);
    }
  }

  private async generateOtp(): Promise<{ otp: string; hashedOtp: string }> {
    let otp: string;
    if (this.configService.getEnv() === 'development') {
      otp = this.configService.getOtpDevCode();
    } else {
      otp = Math.floor(100000 + Math.random() * 900000).toString();
    }
    const hashedOtp = await argon.hash(otp);
    return { otp, hashedOtp };
  }
}