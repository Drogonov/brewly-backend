import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserActionType } from '../types/user-action.type';

// MARK: - Project implementation

export interface IGetUserAction {
    type: UserActionType;
    title: string;
    isEnabled: boolean;
    switchIsOn?: boolean;
}

// MARK: - Swagger class

export class GetUserActionDto implements IGetUserAction {
    @ApiProperty({
        description: 'Type of the user action',
        enum: UserActionType,
        example: UserActionType.acceptFriendRequest,
    })
    type: UserActionType;

    @ApiProperty({ example: 'Add to Friends', type: String })
    title: string;

    @ApiProperty({ example: true, type: Boolean })
    isEnabled: boolean;

    @ApiPropertyOptional({ example: false, type: Boolean })
    switchIsOn?: boolean;
}