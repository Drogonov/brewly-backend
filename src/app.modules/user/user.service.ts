import { Injectable } from '@nestjs/common';
import { GetUserActionType, GetUserRequestDto, IGetUserResponse, ISearchUserResponse, ISearchUsersResponse, SearchUsersRequestDto, SearchUserType } from './dto';
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
                    type: GetUserActionType.addToFriends,
                    title: 'Add to Friends',
                    isEnabled: false
                },
                {
                    type: GetUserActionType.addToTeam,
                    title: 'Add to Team',
                    isEnabled: false
                },
                {
                    type: GetUserActionType.removeFromFriends,
                    title: 'Remove from Friends',
                    isEnabled: false
                },
                {
                    type: GetUserActionType.removeFromTeam,
                    title: 'Remove from Team',
                    isEnabled: false
                },
                {
                    type: GetUserActionType.makeChief,
                    title: 'Make Chief',
                    isEnabled: false,
                    switchIsOn: true
                }
            ]
        }
    }
}