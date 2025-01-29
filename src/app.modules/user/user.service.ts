import { Injectable } from '@nestjs/common';
import { ISearchUserResponse, SearchUserRequestDto } from './dto';

@Injectable()
export class UserService {

    async searchForUsers(dto: SearchUserRequestDto): Promise<ISearchUserResponse[]> {
        return [
            {
                userId: 0,
                userName: 'John Wayne',
                email: 'test@test.com',
                isChief: true,
                isOwner: true
            }
        ];
    }
}