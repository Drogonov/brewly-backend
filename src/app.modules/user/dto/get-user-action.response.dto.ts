import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// MARK: - Project implementation

export interface IGetUserAction {
    type: GetUserActionType;
    title: string;
    isEnabled: boolean;
    switchIsOn?: boolean
}

export enum GetUserActionType {
    addToFriends = 'addToFriends',
    addToTeam = 'addToTeam',
    removeFromFriends = 'removeFromFriends',
    removeFromTeam = 'removeFromTeam',
    makeChief = 'makeChief',
}

// MARK: - Swagger class

export class GetUserActionDto implements IGetUserAction {
    @ApiProperty({ example: 'addToFriends' })
    type: GetUserActionType;

    @ApiProperty({ example: 'Add to Friends' })
    title: string;

    @ApiProperty({ example: true })
    isEnabled: boolean;

    @ApiPropertyOptional({ example: false })
    switchIsOn?: boolean;
}