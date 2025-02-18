import { Injectable } from '@nestjs/common';
import { IStatusResponse, GetUserRequestDto, IGetUserResponse, ISearchUserResponse, ISearchUsersResponse, MakeUserActionRequest, SearchUsersRequestDto, SearchUserType, UserActionType, StatusType } from './dto';
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
}