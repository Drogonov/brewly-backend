import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/app.services/prisma/prisma.service';
import {
  IStatusResponse,
  SearchUserType,
  UserActionType,
  StatusType,
  UserNotificationType,
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
} from './dto';
import { User, Friendship, TeamInvitation, Role as PrismaRole, Role } from '@prisma/client';
import { FriendshipType, TeamInvitationType } from '@prisma/client';
import { MappingService } from 'src/app.common/services/mapping.service';
import { CompanyRulesService } from 'src/app.common/services/company-rules.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private mappingService: MappingService,
    private companyRulesService: CompanyRulesService
  ) { }

  async searchUsers(
    userId: number,
    currentCompanyId: number,
    dto: SearchUsersRequestDto
  ): Promise<ISearchUsersResponse> {
    if (dto.type === SearchUserType.friendsList) {
      const friendships = await this.prisma.friendship.findMany({
        where: {
          OR: [
            { senderId: userId, type: FriendshipType.FRIEND },
            { receiverId: userId, type: FriendshipType.FRIEND },
          ],
        },
      });
      const friendIds = friendships.map(fs =>
        fs.senderId === userId ? fs.receiverId : fs.senderId
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
      const mappedUsers = users.map(user => this.mappingService.mapUser(user));
      return { users: mappedUsers };
    } else {
      const users = await this.prisma.user.findMany({
        where: {
          id: { not: userId },
          OR: [
            { userName: { contains: dto.searchStr, mode: 'insensitive' } },
            { email: { contains: dto.searchStr, mode: 'insensitive' } },
          ],
        },
      });
      const mappedUsers = users.map(user => this.mappingService.mapUser(user));
      return { users: mappedUsers };
    }
  }

  async getUsersList(
    userId: number,
    currentCompanyId: number,
    type: SearchUserType
  ): Promise<ISearchUsersResponse> {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [
          { senderId: userId, type: FriendshipType.FRIEND },
          { receiverId: userId, type: FriendshipType.FRIEND },
        ],
      },
    });
    const friendIds = friendships.map(fs =>
      fs.senderId === userId ? fs.receiverId : fs.senderId
    );
    const users = await this.prisma.user.findMany({
      where: { id: { in: friendIds } },
    });
    const mappedUsers = users.map(user => this.mappingService.mapUser(user));
    return { users: mappedUsers };
  }

  async getUserCard(
    userId: number,
    currentCompanyId: number,
    dto: GetUserCardRequestDto
  ): Promise<IGetUserCardResponse> {
    const targetUser = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!targetUser) {
      throw new Error('User not found');
    }

    const userInfo = this.mappingService.mapUser(targetUser);
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId: dto.userId },
          { senderId: dto.userId, receiverId: userId },
        ],
      },
    });
    const teamInvitation = await this.prisma.teamInvitation.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId: dto.userId },
          { senderId: dto.userId, receiverId: userId },
        ],
      },
    });
    const targetUserRelation = await this.prisma.userToCompanyRelation.findFirst({
      where: { userId: dto.userId, companyId: currentCompanyId },
    });
    const currentUserRelation = await this.prisma.userToCompanyRelation.findFirst({
      where: { userId: userId },
      include: { company: { include: { relatedToUsers: true } } },
    });
    const showMakeChief = await this.companyRulesService.shouldShowMakeChiefAction(currentCompanyId);

    const isFriend = friendship ? friendship.type === FriendshipType.FRIEND : false;
    const isIncomingFriendRequest = friendship ? friendship.type === FriendshipType.REQUEST : false;
    const isTeammate = targetUserRelation ? true : false;
    const isIncomingTeamRequest = teamInvitation ? teamInvitation.type === TeamInvitationType.REQUEST : false;
    const isCompanyPersonal = currentUserRelation.company.isPersonal;

    const actions: IGetUserAction[] = [
      {
        type: UserActionType.addToFriends,
        title: 'Add to Friends',
        isEnabled: !isFriend && !isIncomingFriendRequest,
      },
      {
        type: UserActionType.removeFromFriends,
        title: 'Remove from Friends',
        isEnabled: isFriend,
      },
      {
        type: UserActionType.addToTeam,
        title: 'Add to Team',
        isEnabled: !isTeammate && !isIncomingTeamRequest && !isCompanyPersonal,
      },
      {
        type: UserActionType.removeFromTeam,
        title: 'Remove from Team',
        isEnabled: isTeammate && !isCompanyPersonal,
      },
    ];

    // Only include "Make Chief" action if the flag is enabled
    if (showMakeChief && !isCompanyPersonal) {
      actions.push({
        type: UserActionType.makeChief,
        title: 'Make Chief',
        isEnabled: true,
        switchIsOn: !(targetUserRelation.role === Role.CHIEF),
      });
    }

    // If there's an incoming friend request
    if (isIncomingFriendRequest) {
      actions.push({
        type: UserActionType.acceptFriendRequest,
        title: 'Accept Friend Request',
        isEnabled: true,
      });
    }

    // If there's an incoming team invitation
    if (isIncomingTeamRequest && !isCompanyPersonal) {
      actions.push({
        type: UserActionType.acceptTeamRequest,
        title: 'Accept Team Request',
        isEnabled: true,
      });
    }

    let status = 'Stranger';
    if (isFriend && isTeammate) {
      status = 'Friends, teammates';
    } else if (isFriend) {
      status = 'Friends';
    } else if (isTeammate) {
      status = 'Teammates';
    }

    return {
      userInfo,
      status,
      actions,
    };
  }

  async getUserInfo(userId: number): Promise<IUserInfoResponse> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
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
      const targetUser = await this.prisma.user.findUnique({
        where: { id: req.receiverId },
      });
      requests.push(
        this.mappingService.mapFriendRequest(req, targetUser)
      );
    }
    for (const req of teamRequests) {
      const targetUser = await this.prisma.user.findUnique({
        where: { id: req.receiverId },
      });
      requests.push(
        this.mappingService.mapTeamInvitation(req, targetUser)
      );
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

    const notifications = [];

    for (const req of friendRequests) {
      const sender = await this.prisma.user.findUnique({
        where: { id: req.senderId },
      });
      notifications.push(
        this.mappingService.mapFriendRequestNotification(req, sender)
      );
    }
    for (const req of teamInvitations) {
      const sender = await this.prisma.user.findUnique({
        where: { id: req.senderId },
      });
      notifications.push(
        this.mappingService.mapTeamInvitationNotification(req, sender)
      );
    }
    notifications.sort((a, b) =>
      a.notificationDate < b.notificationDate ? 1 : -1
    );

    friendRequests.forEach(async (request) =>
      await this.prisma.friendship.update({
        where: {
          id: request.id
        },
        data: {
          wasLoadedByReceiver: true
        }
      })
    );

    teamInvitations.forEach(async (request) =>
      await this.prisma.friendship.update({
        where: {
          id: request.id
        },
        data: {
          wasLoadedByReceiver: true
        }
      })
    );

    return { 
      notifications
    };
  }

  async makeUserAction(
    userId: number,
    currentCompanyId: number,
    dto: MakeUserActionRequest
  ): Promise<IStatusResponse> {
    switch (dto.type) {
      case UserActionType.addToFriends: {
        const existing = await this.prisma.friendship.findFirst({
          where: {
            OR: [
              { senderId: userId, receiverId: dto.userId },
              { senderId: dto.userId, receiverId: userId },
            ],
          },
        });
        if (existing) {
          if (existing.type != FriendshipType.FRIEND) {
            await this.prisma.friendship.updateMany({
              where: {
                OR: [
                  { senderId: userId, receiverId: dto.userId },
                  { senderId: dto.userId, receiverId: userId },
                ],
              },
              data: {
                type: FriendshipType.REQUEST
              }
            });
          } else {
            return {
              status: StatusType.DENIED,
              description: 'Friendship or request already exists',
            };
          }
        }
        await this.prisma.friendship.create({
          data: {
            senderId: userId,
            receiverId: dto.userId,
            type: FriendshipType.REQUEST,
          },
        });
        return { status: StatusType.SUCCESS, description: 'Friend request sent' };
      }
      case UserActionType.removeFromFriends: {
        await this.prisma.friendship.updateMany({
          where: {
            OR: [
              { senderId: userId, receiverId: dto.userId },
              { senderId: dto.userId, receiverId: userId },
            ],
          },
          data: {
            type: FriendshipType.ENDED
          }
        });
        return { status: StatusType.SUCCESS, description: 'Friend removed' };
      }
      case UserActionType.addToTeam: {
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
            description: 'Team invitation already sent',
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
        return { status: StatusType.SUCCESS, description: 'Team invitation sent' };
      }
      case UserActionType.removeFromTeam: {
        await this.prisma.teamInvitation.deleteMany({
          where: {
            senderId: userId,
            receiverId: dto.userId,
            type: TeamInvitationType.TEAM,
          },
        });
        return { status: StatusType.SUCCESS, description: 'Removed from team' };
      }
      case UserActionType.makeChief: {
        await this.prisma.userToCompanyRelation.updateMany({
          where: {
            userId: dto.userId,
            companyId: currentCompanyId,
          },
          data: { role: PrismaRole.CHIEF },
        });
        return { status: StatusType.SUCCESS, description: 'User is now Chief' };
      }
      case UserActionType.acceptFriendRequest: {
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
            description: 'No friend request to accept.',
          };
        }
        await this.prisma.friendship.update({
          where: { id: existingRequest.id },
          data: { type: FriendshipType.FRIEND },
        });
        return {
          status: StatusType.SUCCESS,
          description: 'Friend request accepted',
        };
      }
      case UserActionType.acceptTeamRequest: {
        // Find the existing invitation from the target user → me
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
            description: 'No team invitation to accept.',
          };
        }

        // Mark the invitation as TEAM (or just delete it if you prefer)
        await this.prisma.teamInvitation.update({
          where: { id: existingInvitation.id },
          data: { type: TeamInvitationType.TEAM },
        });

        // Ensure there's a userToCompanyRelation
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
          description: 'Team invitation accepted.',
        };
      }
      default:
        return { status: StatusType.DENIED, description: 'Invalid action' };
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
        return { status: StatusType.SUCCESS, description: 'Friend request cancelled' };
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
        return { status: StatusType.SUCCESS, description: 'Team invitation cancelled' };
      }
    }
    return { status: StatusType.DENIED, description: 'Request not found' };
  }

  async saveEditUser(
    userId: number,
    dto: SaveEditUserRequest,
  ): Promise<StatusResponseDto> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        userName: dto.userName,
        email: dto.email,
        about: dto.about,
      },
    });
    return {
      status: StatusType.SUCCESS,
      description: `User info updated for ${user.userName}`,
    };
  }
}