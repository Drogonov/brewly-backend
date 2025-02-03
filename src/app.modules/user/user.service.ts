import { Injectable } from '@nestjs/common';
import { ISearchUsersResponse } from './dto';

@Injectable()
export class UserService {

    async searchForUsers(
        userId: number,
        currentCompanyId: number,
        str: string
    ): Promise<ISearchUsersResponse> {
        return {
            users: [
                {
                    userId: 0,
                    userName: 'John Wayne',
                    userImageURL: 'https://picsum.photos/seed/picsum/200/300',
                    email: 'test@test.com',
                    isChief: true,
                    isOwner: true
                }
            ]
        };
    }
}