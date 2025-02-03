import { Injectable } from '@nestjs/common';
import { ISearchUsersResponse } from './dto';

@Injectable()
export class UserService {

    async searchForUsers(
        userId: number,
        currentCompanyId: number,
        str: string
    ): Promise<ISearchUsersResponse> {
        console.log(userId);
        console.log(currentCompanyId);
        console.log(str);

        return {
            users: [
                {
                    userId: 0,
                    userName: 'John Wayne',
                    email: 'test@test.com',
                    isChief: true,
                    isOwner: true
                }
            ]
        };
    }
}