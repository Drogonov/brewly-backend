import { IsNotEmpty, IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SearchUserType } from './search-user-type';

export class SearchUsersRequestDto {

  @ApiProperty({ example: "Vlad Emeliyanov" })
  @IsNotEmpty()
  @IsString()
  searchStr: string;

  @IsNotEmpty()
  @ApiProperty({ example: SearchUserType.friendsList })
  type: SearchUserType;
}