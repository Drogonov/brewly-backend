import { IsNotEmpty, IsString, IsEmail, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SearchUserType } from './search-user-type';

export class GetUserRequestDto {

  @ApiProperty({ example: 666 })
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  @ApiProperty({ example: SearchUserType.friendsList })
  type: SearchUserType;
}