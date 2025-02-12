import { Injectable } from '@nestjs/common';
import { ISearchUsersResponse, SearchUserRequestDto, SearchUserType } from './dto';
import { UserRole } from 'src/app.common/dto';

@Injectable()
export class UserService {

    async searchForUsers(
        userId: number,
        currentCompanyId: number,
        dto: SearchUserRequestDto
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
}