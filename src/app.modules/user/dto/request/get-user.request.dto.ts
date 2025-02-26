import { IsNotEmpty, IsString, IsEmail, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SearchUserType } from '../types/search-user-type';

export class GetUserCardRequestDto {

  @ApiProperty({ example: 666 })
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  @ApiProperty({ example: SearchUserType.friendsList })
  type: SearchUserType;
}