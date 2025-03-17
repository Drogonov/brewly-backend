import { IsNotEmpty, IsString, IsEmail, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserActionType } from '../types/user-action.type';
import { Type } from 'class-transformer';

export class MakeUserActionRequest {

  @ApiProperty({ example: 666 })
  @IsNotEmpty()
  @Type(() => Number)
  userId: number;

  @IsNotEmpty()
  @ApiProperty({ example: UserActionType.addToFriends })
  type: UserActionType;

  @ApiProperty({ example: false })
  @IsOptional()
  @Type(() => Boolean)
  switchIsOn?: boolean;
}