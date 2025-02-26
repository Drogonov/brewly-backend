import { IsNotEmpty, IsString, IsEmail, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserActionType } from '../types/user-action.type';

export class MakeUserActionRequest {

  @ApiProperty({ example: 666 })
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  @ApiProperty({ example: UserActionType.addToFriends })
  type: UserActionType;

  @ApiProperty({ example: false })
  @IsOptional()
  switchIsOn?: boolean;
}