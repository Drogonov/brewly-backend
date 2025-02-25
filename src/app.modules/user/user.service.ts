import { Injectable } from '@nestjs/common';
import { IStatusResponse, GetUserRequestDto, IGetUserResponse, ISearchUsersResponse, MakeUserActionRequest, SearchUsersRequestDto, SearchUserType, UserActionType, StatusType, IGetUserSendedRequestsResponse, IGetUserNotificationsResponse, UserNotificationType, SaveEditUserRequest, StatusResponseDto, IGetUserDataResponse } from './dto';
import { UserRole } from 'src/app.common/dto';

@Injectable()
export class UserService {

    async searchForUsers(
        userId: number,
        currentCompanyId: number,
        dto: SearchUsersRequestDto
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

    async getUser(
        userId: number,
        currentCompanyId: number,
        dto: GetUserRequestDto
    ): Promise<IGetUserResponse> {
        return {
            userId: 0,
            userName: 'John Wayne',
            userImageURL: 'https://picsum.photos/seed/picsum/200/300',
            email: 'test@test.com',
            comment: "Some info about user",
            role: UserRole.barista,
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

    async getUserData(
        userId: number
    ): Promise<IGetUserDataResponse> { 
        return {
            userId: 0,
            userName: 'John Wayne',
            userImageURL: 'https://picsum.photos/seed/picsum/200/300',
            email: 'test@test.com',
            about: "Some info about user"
        }
    }

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

    async saveEditUser(
        userId: number,
        dto: SaveEditUserRequest
    ): Promise<StatusResponseDto> {
        return {
            status: StatusType.SUCCESS,
            description: "We updated user info"
        }
    }
}