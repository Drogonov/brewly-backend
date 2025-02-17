import { Injectable } from '@nestjs/common';
import { GetUserRequestDto, IGetUserResponse, ISearchUserResponse, ISearchUsersResponse, SearchUsersRequestDto, SearchUserType } from './dto';
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
            role: UserRole.barista,
        }
    }
}