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
} from './dto';
import { IUserInfoResponse, UserRole } from 'src/app.common/dto';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
    constructor(
        private prisma: PrismaService,
    ) { }

    // Need to add friends and team feature to users
    async searchUsers(
        userId: number,
        currentCompanyId: number,
        dto: SearchUsersRequestDto
    ): Promise<ISearchUsersResponse> {
        // Only handling global search logic.
        // if (dto.type !== SearchUserType.friendsGlobalSearch) {
        //     return { users: [] };
        // }

        // Search for users (excluding the current user) whose userName or email matches the search string.
        const users = await this.prisma.user.findMany({
            where: {
                id: { not: userId },
                OR: [
                    { userName: { contains: dto.searchStr, mode: 'insensitive' } },
                    { email: { contains: dto.searchStr, mode: 'insensitive' } },
                ],
            },
        });

        const mapUser = (user: User): IUserInfoResponse => ({
            userId: user.id,
            userName: user.userName,
            userImageURL: user.userImageURL,
            email: user.email,
            role: UserRole.barista,
            about: user.about
        });

        const mappedUsers = users.map(user => mapUser(user));

        return { users: mappedUsers };
    }

    // Need to add friends and team feature to users
    async getUsersList(
        userId: number,
        currentCompanyId: number,
        type: SearchUserType
    ): Promise<ISearchUsersResponse> {
        return {
            users: [
                {
                    userId: 0,
                    userName: 'John Wayne',
                    userImageURL: 'https://picsum.photos/seed/picsum/200/300',
                    email: 'test@test.com',
                    role: UserRole.barista,
                }
            ]
        };
    }

    // Need to add Action, Request, Notification logic
    async getUserCard(
        userId: number,
        currentCompanyId: number,
        dto: GetUserCardRequestDto
    ): Promise<IGetUserCardResponse> {
        return {
            userInfo: {
                userId: 0,
                userName: 'John Wayne',
                userImageURL: 'https://picsum.photos/seed/picsum/200/300',
                email: 'test@test.com',
                about: "Some info about user",
                role: UserRole.barista,
            },
            status: "Friends, teammates",
            actions: [
                {
                    type: UserActionType.addToFriends,
                    title: 'Add to Friends',
                    isEnabled: false
                },
                {
                    type: UserActionType.addToTeam,
                    title: 'Add to Team',
                    isEnabled: false
                },
                {
                    type: UserActionType.removeFromFriends,
                    title: 'Remove from Friends',
                    isEnabled: false
                },
                {
                    type: UserActionType.removeFromTeam,
                    title: 'Remove from Team',
                    isEnabled: false
                },
                {
                    type: UserActionType.makeChief,
                    title: 'Make Chief',
                    isEnabled: false,
                    switchIsOn: true
                }
            ]
        }
    }

    async getUserInfo(
        userId: number
    ): Promise<IUserInfoResponse> {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        const mapUser = (user: User): IUserInfoResponse => ({
            userId: user.id,
            userName: user.userName,
            userImageURL: user.userImageURL,
            email: user.email,
            role: UserRole.barista,
            about: user.about
        });

        return mapUser(user);
    }

    // Need to add Request Logic
    async getUserSendedRequests(
        userId: number,
        currentCompanyId: number,
    ): Promise<IGetUserSendedRequestsResponse> {
        return {
            requests: [
                {
                    requestId: 0,
                    requestDate: '2025-01-01T00:00:00Z',
                    description: 'Заявка на добавление в друзья пользователя Naggibator',
                    status: 'pending'
                },
                {
                    requestId: 1,
                    requestDate: '2025-02-01T00:00:00Z',
                    description: 'Заявка на добавление в команду пользователя Some User'
                }
            ]
        }
    }

    // Need to add Notifications
    async getUserNotifications(
        userId: number,
        currentCompanyId: number,
    ): Promise<IGetUserNotificationsResponse> {
        return {
            notifications: [
                {
                    notificationId: 0,
                    notificationDate: '2025-01-01T00:00:00Z',
                    iconName: 'person',
                    description: 'У вас новая заявка в друзья от Person',
                    type: UserNotificationType.friendRequest
                },
                {
                    notificationId: 1,
                    notificationDate: '2025-02-01T00:00:00Z',
                    iconName: 'bell',
                    description: 'Шеф-бариста User Name приглашает вас на капинг',
                    type: UserNotificationType.cuppingInvitation
                },
            ]
        }
    }

    // Need to add Action logic (for user Card)
    async makeUserAction(
        userId: number,
        currentCompanyId: number,
        dto: MakeUserActionRequest
    ): Promise<IStatusResponse> {
        return {
            status: StatusType.SUCCESS,
            description: "We sended message to user"
        }
    }

    // Need to add Requests
    async rejectUserSendedRequest(
        userId: number,
        currentCompanyId: number,
        requestId: number
    ): Promise<IStatusResponse> {
        return {
            status: StatusType.SUCCESS,
            description: "Заявка успешно отменена"
        }
    }

    async saveEditUser(
        userId: number,
        dto: SaveEditUserRequest
    ): Promise<StatusResponseDto> {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                userName: dto.userName,
                email: dto.email,
                about: dto.about
            }
        })

        return {
            status: StatusType.SUCCESS,
            description: `We updated info for ${user.userName}`
        }
    }
}