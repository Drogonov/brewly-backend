import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserActionType } from './user-action.type';

// MARK: - Project implementation

export interface IGetUserAction {
    type: UserActionType;
    title: string;
    isEnabled: boolean;
    switchIsOn?: boolean;
}

// MARK: - Swagger class

export class GetUserActionDto implements IGetUserAction {
    @ApiProperty({ example: 'addToFriends' })
    type: UserActionType;

    @ApiProperty({ example: 'Add to Friends' })
    title: string;

    @ApiProperty({ example: true })
    isEnabled: boolean;

    @ApiPropertyOptional({ example: false })
    switchIsOn?: boolean;
}