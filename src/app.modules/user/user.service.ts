import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/app.common/services/prisma/prisma.service';
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
} from './dto';
import {
  Friendship,
  TeamInvitation,
  Role as PrismaRole,
  Role,
  FriendshipType,
  TeamInvitationType,
} from '@prisma/client';
import { MappingService } from 'src/app.common/services/mapping.service';
import { CompanyRulesService } from 'src/app.common/services/company-rules.service';
import { ErrorSubCode } from 'src/app.common/error-handling/exceptions';
import { ErrorHandlingService } from 'src/app.common/error-handling/error-handling.service';
import { LocalizationStringsService } from 'src/app.common/localization/localization-strings-service';
import { UserKeys } from 'src/app.common/localization/generated/user.enum';
import { MailService } from 'src/app.common/services/mail/mail.service';
import * as argon from 'argon2';
import { ConfigurationService } from 'src/app.common/services/config/configuration.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private mappingService: MappingService,
    private companyRulesService: CompanyRulesService,
    private errorHandlingService: ErrorHandlingService,
    private localizationStringsService: LocalizationStringsService,
    private mailService: MailService,
    private configService: ConfigurationService
  ) { }

  async searchUsers(
    userId: number,
    currentCompanyId: number,
    dto: SearchUsersRequestDto,
  ): Promise<ISearchUsersResponse> {
    switch (dto.type) {
      case SearchUserType.friendsList:
        return await this.searchFriends(userId, dto);

      case SearchUserType.teamList:
        return await this.searchTeam(userId, currentCompanyId, dto);

      case SearchUserType.friendsGlobalSearch:
        return await this.searchGlobal(userId, dto);
    }
  }

  async getUsersList(
    userId: number,
    currentCompanyId: number,
    type: SearchUserType,
  ): Promise<ISearchUsersResponse> {
    switch (type) {
      case SearchUserType.friendsList:
        const friendships = await this.prisma.friendship.findMany({
          where: {
            OR: [
              { senderId: userId, type: FriendshipType.FRIEND },
              { receiverId: userId, type: FriendshipType.FRIEND },
            ],
          },
        });
        const friendIds = friendships.map(fs =>
          fs.senderId === userId ? fs.receiverId : fs.senderId,
        );
        const users = await this.prisma.user.findMany({
          where: { id: { in: friendIds } },
        });
        return { users: users.map(user => this.mappingService.mapUser(user)) };

      case SearchUserType.teamList:
        const relations = await this.prisma.userToCompanyRelation.findMany({
          where: { companyId: currentCompanyId },
          include: { user: true },
        });
        const team = relations.map(relation => relation.user);
        return { users: team.map(user => this.mappingService.mapUser(user)) };

      case SearchUserType.friendsGlobalSearch:
        return { users: [] };
    }
  }

  async getUserCard(
    userId: number,
    currentCompanyId: number,
    dto: GetUserCardRequestDto,
  ): Promise<IGetUserCardResponse> {
    const targetUser = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!targetUser) {
      throw await this.errorHandlingService.getBusinessError(ErrorSubCode.USER_DOESNT_EXIST);
    }
    const userInfo = this.mappingService.mapUser(targetUser);
    const actions = await this.buildUserActions(userId, currentCompanyId, dto.userId);
    const status = await this.buildUserStatus(userId, currentCompanyId, dto.userId);
    return { userInfo, status, actions };
  }

  async getUserInfo(userId: number): Promise<IUserInfoResponse> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw await this.errorHandlingService.getBusinessError(ErrorSubCode.USER_DOESNT_EXIST);
    }
    return this.mappingService.mapUser(user);
  }

  async getUserSendedRequests(
    userId: number,
    currentCompanyId: number,
  ): Promise<IGetUserSendedRequestsResponse> {
    const friendRequests = await this.prisma.friendship.findMany({
      where: { senderId: userId, type: FriendshipType.REQUEST },
    });
    const teamRequests = await this.prisma.teamInvitation.findMany({
      where: { senderId: userId, type: TeamInvitationType.REQUEST },
    });
    const requests: IGetUserSendedRequestResponse[] = [];
    for (const req of friendRequests) {
      const targetUser = await this.prisma.user.findUnique({ where: { id: req.receiverId } });
      if (targetUser) {
        requests.push(this.mappingService.mapFriendRequest(req, targetUser));
      }
    }
    for (const req of teamRequests) {
      const targetUser = await this.prisma.user.findUnique({ where: { id: req.receiverId } });
      if (targetUser) {
        requests.push(this.mappingService.mapTeamInvitation(req, targetUser));
      }
    }
    return { requests };
  }

  async getUserNotifications(
    userId: number,
    currentCompanyId: number,
  ): Promise<IGetUserNotificationsResponse> {
    const friendRequests = await this.prisma.friendship.findMany({
      where: { receiverId: userId, type: FriendshipType.REQUEST },
    });
    const teamInvitations = await this.prisma.teamInvitation.findMany({
      where: { receiverId: userId, type: TeamInvitationType.REQUEST },
    });
    const notifications = await this.buildNotifications(friendRequests, teamInvitations);
    return { notifications };
  }

  async makeUserAction(
    userId: number,
    currentCompanyId: number,
    dto: MakeUserActionRequest,
  ): Promise<IStatusResponse> {
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
          description: await this.localizationStringsService.getUserText(UserKeys.INVALID_ACTION),
        };
    }
  }

  async rejectUserSendedRequest(
    userId: number,
    currentCompanyId: number,
    dto: RejectUserSendedRequestRequest,
  ): Promise<IStatusResponse> {
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
          description: await this.localizationStringsService.getUserText(UserKeys.FRIEND_REMOVED),
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
          description: await this.localizationStringsService.getUserText(UserKeys.TEAM_INVITATION_CANCELLED),
        };
      }
    }
    return {
      status: StatusType.DENIED,
      description: await this.localizationStringsService.getUserText(UserKeys.REQUEST_NOT_FOUND)
    };
  }

  async saveEditUser(
    userId: number,
    dto: SaveEditUserRequest,
  ): Promise<StatusResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw await this.errorHandlingService.getBusinessError(ErrorSubCode.USER_DOESNT_EXIST);
    }
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { userName: dto.userName, about: dto.about },
    });
    if (dto.email && dto.email !== user.email) {
      await this.confirmEmailChange(userId, dto.email);
      return {
        status: StatusType.SUCCESS,
        description: await this.localizationStringsService.getUserText(UserKeys.OTP_SENT_FOR_EMAIL_CHANGE),
      };
    }
    return {
      status: StatusType.SUCCESS,
      description: await this.localizationStringsService.getUserText(UserKeys.USER_INFO_UPDATED),
    };
  }

  async verifyNewEmail(
    userId: number,
    dto: OTPRequestDto,
  ): Promise<StatusResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw await this.errorHandlingService.getBusinessError(ErrorSubCode.USER_DOESNT_EXIST);
    }
    const isOtpValid = await argon.verify(user.otpHash, dto.otp);
    if (!isOtpValid) {
      return {
        status: StatusType.DENIED,
        description: await this.localizationStringsService.getUserText(UserKeys.INCORRECT_OTP),
      };
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { email: dto.email, otpHash: null },
    });
    return {
      status: StatusType.SUCCESS,
      description: await this.localizationStringsService.getUserText(UserKeys.EMAIL_UPDATED),
    };
  }

  async resendNewEmailOTP(userId: number, newEmail: string): Promise<StatusResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw await this.errorHandlingService.getBusinessError(ErrorSubCode.USER_DOESNT_EXIST);
    }

    const { otp, hashedOtp } = await this.generateOtp();
    await this.prisma.user.update({
      where: { id: userId },
      data: { otpHash: hashedOtp },
    });
    await this.sendOtp(user.email, newEmail, otp);

    return {
      status: StatusType.SUCCESS,
      description: await this.localizationStringsService.getUserText(UserKeys.OTP_RESENT),
    };
  }

  // MARK: - Private Methods

  private async searchFriends(userId: number, dto: SearchUsersRequestDto): Promise<ISearchUsersResponse> {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [
          { senderId: userId, type: FriendshipType.FRIEND },
          { receiverId: userId, type: FriendshipType.FRIEND },
        ],
      },
    });
    const friendIds = friendships.map(fs =>
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
    return { users: users.map(user => this.mappingService.mapUser(user)) };
  }

  private async searchTeam(currentUserId:number, currentCompanyId: number, dto: SearchUsersRequestDto): Promise<ISearchUsersResponse> {
    // Get all users related to the current company (team members)
    const relations = await this.prisma.userToCompanyRelation.findMany({
      where: { companyId: currentCompanyId },
      include: { user: true },
    });
    // Filter out the current user and apply the search string filter if provided
    const filteredUsers = relations
      .map(relation => relation.user)
      .filter(user => {
        if (user.id === currentUserId) { // assuming dto.currentUserId contains the caller's id
          return false;
        }
        if (!dto.searchStr) return true;
        const searchLower = dto.searchStr.toLowerCase();
        return (user.userName && user.userName.toLowerCase().includes(searchLower)) ||
               (user.email && user.email.toLowerCase().includes(searchLower));
      });
    return { users: filteredUsers.map(user => this.mappingService.mapUser(user)) };
  }

  private async searchGlobal(userId: number, dto: SearchUsersRequestDto): Promise<ISearchUsersResponse> {
    const users = await this.prisma.user.findMany({
      where: {
        id: { not: userId },
        OR: [
          { userName: { contains: dto.searchStr, mode: 'insensitive' } },
          { email: { contains: dto.searchStr, mode: 'insensitive' } },
        ],
      },
    });
    return { users: users.map(user => this.mappingService.mapUser(user)) };
  }

  private async buildUserActions(
    currentUserId: number,
    currentCompanyId: number,
    targetUserId: number,
  ): Promise<IGetUserAction[]> {
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
    const currentUserRelation = await this.prisma.userToCompanyRelation.findFirst({
      where: { userId: currentUserId },
      include: { company: true },
    });
    const showMakeChief = await this.companyRulesService.shouldShowMakeChiefAction(currentCompanyId);
    const isFriend = friendship ? friendship.type === FriendshipType.FRIEND : false;
    const isIncomingFriendRequest = friendship ? friendship.type === FriendshipType.REQUEST : false;
    const isTeammate = !!targetUserRelation;
    const isIncomingTeamRequest = teamInvitation ? teamInvitation.type === TeamInvitationType.REQUEST : false;
    const isCompanyPersonal = currentUserRelation?.company?.isPersonal;

    actions.push({
      type: UserActionType.addToFriends,
      title: await this.localizationStringsService.getUserText(UserKeys.ADD_TO_FRIENDS),
      isEnabled: !isFriend && !isIncomingFriendRequest,
    });
    actions.push({
      type: UserActionType.removeFromFriends,
      title: await this.localizationStringsService.getUserText(UserKeys.REMOVE_FROM_FRIENDS),
      isEnabled: isFriend,
    });
    actions.push({
      type: UserActionType.addToTeam,
      title: await this.localizationStringsService.getUserText(UserKeys.ADD_TO_TEAM),
      isEnabled: !isTeammate && !isIncomingTeamRequest && !isCompanyPersonal,
    });
    actions.push({
      type: UserActionType.removeFromTeam,
      title: await this.localizationStringsService.getUserText(UserKeys.REMOVE_FROM_TEAM),
      isEnabled: isTeammate && !isCompanyPersonal,
    });
    if (showMakeChief && !isCompanyPersonal) {
      actions.push({
        type: UserActionType.makeChief,
        title: await this.localizationStringsService.getUserText(UserKeys.MAKE_CHIEF),
        isEnabled: true,
        switchIsOn: !(targetUserRelation?.role === Role.CHIEF),
      });
    }
    if (isIncomingFriendRequest) {
      actions.push({
        type: UserActionType.acceptFriendRequest,
        title: await this.localizationStringsService.getUserText(UserKeys.ACCEPT_FRIEND_REQUEST),
        isEnabled: true,
      });
    }
    if (isIncomingTeamRequest && !isCompanyPersonal) {
      actions.push({
        type: UserActionType.acceptTeamRequest,
        title: await this.localizationStringsService.getUserText(UserKeys.ACCEPT_TEAM_REQUEST),
        isEnabled: true,
      });
    }
    return actions;
  }

  // FIXED: Now builds status based on friendship and team relation.
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
    let status = 'Stranger';
    if (isFriend && isTeammate) {
      status = 'Friends, teammates';
    } else if (isFriend) {
      status = 'Friends';
    } else if (isTeammate) {
      status = 'Teammates';
    }
    return status;
  }

  private async buildNotifications(
    friendRequests: Friendship[],
    teamInvitations: TeamInvitation[],
  ): Promise<any[]> {
    const notifications = [];
    for (const req of friendRequests) {
      const sender = await this.prisma.user.findUnique({ where: { id: req.senderId } });
      if (sender) {
        notifications.push(this.mappingService.mapFriendRequestNotification(req, sender));
      }
    }
    for (const req of teamInvitations) {
      const sender = await this.prisma.user.findUnique({ where: { id: req.senderId } });
      if (sender) {
        notifications.push(this.mappingService.mapTeamInvitationNotification(req, sender));
      }
    }
    notifications.sort((a, b) => (a.notificationDate < b.notificationDate ? 1 : -1));

    // Use Promise.all to update notifications concurrently
    await Promise.all([
      ...friendRequests.map(request =>
        this.prisma.friendship.update({ where: { id: request.id }, data: { wasLoadedByReceiver: true } })
      ),
      ...teamInvitations.map(request =>
        this.prisma.teamInvitation.update({ where: { id: request.id }, data: { wasLoadedByReceiver: true } })
      )
    ]);

    return notifications;
  }

  private async handleAddToFriends(userId: number, dto: MakeUserActionRequest): Promise<IStatusResponse> {
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
          description: await this.localizationStringsService.getUserText(UserKeys.FRIEND_REQUEST_SENT),
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
      description: await this.localizationStringsService.getUserText(UserKeys.FRIEND_REQUEST_SENT),
    };
  }

  private async handleRemoveFromFriends(userId: number, dto: MakeUserActionRequest): Promise<IStatusResponse> {
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
      description: await this.localizationStringsService.getUserText(UserKeys.FRIEND_REMOVED),
    };
  }

  private async handleAddToTeam(userId: number, currentCompanyId: number, dto: MakeUserActionRequest): Promise<IStatusResponse> {
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
        description: await this.localizationStringsService.getUserText(UserKeys.TEAM_INVITATION_ALREADY_SENT),
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
      description: await this.localizationStringsService.getUserText(UserKeys.TEAM_INVITATION_SENT),
    };
  }

  private async handleRemoveFromTeam(userId: number, dto: MakeUserActionRequest): Promise<IStatusResponse> {
    await this.prisma.teamInvitation.deleteMany({
      where: {
        senderId: userId,
        receiverId: dto.userId,
        type: TeamInvitationType.TEAM,
      },
    });
    return {
      status: StatusType.SUCCESS,
      description: await this.localizationStringsService.getUserText(UserKeys.REMOVED_FROM_TEAM),
    };
  }

  private async handleMakeChief(currentCompanyId: number, dto: MakeUserActionRequest): Promise<IStatusResponse> {
    await this.prisma.userToCompanyRelation.updateMany({
      where: { userId: dto.userId, companyId: currentCompanyId },
      data: { role: PrismaRole.CHIEF },
    });
    return {
      status: StatusType.SUCCESS,
      description: await this.localizationStringsService.getUserText(UserKeys.USER_NOW_CHIEF),
    };
  }

  private async handleAcceptFriendRequest(userId: number, dto: MakeUserActionRequest): Promise<IStatusResponse> {
    const existingRequest = await this.prisma.friendship.findFirst({
      where: { senderId: dto.userId, receiverId: userId, type: FriendshipType.REQUEST },
    });
    if (!existingRequest) {
      return {
        status: StatusType.DENIED,
        description: await this.localizationStringsService.getUserText(UserKeys.NO_FRIEND_REQUEST),
      };
    }
    await this.prisma.friendship.update({
      where: { id: existingRequest.id },
      data: { type: FriendshipType.FRIEND },
    });
    return {
      status: StatusType.SUCCESS,
      description: await this.localizationStringsService.getUserText(UserKeys.FRIEND_REQUEST_ACCEPTED),
    };
  }

  private async handleAcceptTeamRequest(userId: number, currentCompanyId: number, dto: MakeUserActionRequest): Promise<IStatusResponse> {
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
        description: await this.localizationStringsService.getUserText(UserKeys.NO_TEAM_INVITATION),
      };
    }
    await this.prisma.teamInvitation.update({
      where: { id: existingInvitation.id },
      data: { type: TeamInvitationType.TEAM },
    });
    const existingRelation = await this.prisma.userToCompanyRelation.findFirst({
      where: { userId: userId, companyId: existingInvitation.companyId },
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
      description: await this.localizationStringsService.getUserText(UserKeys.TEAM_INVITATION_ACCEPTED),
    };
  }

  private async confirmEmailChange(userId: number, newEmail: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw await this.errorHandlingService.getBusinessError(ErrorSubCode.USER_DOESNT_EXIST);
    }
    const { otp, hashedOtp } = await this.generateOtp();
    await this.prisma.user.update({
      where: { id: userId },
      data: { otpHash: hashedOtp },
    });
    await this.sendOtp(user.email, newEmail, otp);
  }

  /**
   * Sends the OTP email.
   * In development mode, it skips calling the mail service.
   */
  private async sendOtp(currentEmail: string, newEmail: string, otp: string): Promise<void> {
    if (this.configService.getEnv() !== 'development') {
      await this.mailService.sendOtpToUpdateEmail(currentEmail, newEmail, otp);
    }
  }

  /**
   * Generates an OTP and its hashed version.
   * In development, returns a fixed OTP from configuration.
   * In production, generates a random 6-digit OTP.
   */
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