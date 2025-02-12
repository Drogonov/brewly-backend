import { IsNotEmpty, IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SearchUserType {
  friendsList = 'friendsList',
  friendsGlobalSearch = 'friendsGlobalSearch',
  teammatesList = 'teammatesList',
  teammatesGlobalSearch = 'teammatesGlobalSearch',
}

export class SearchUserRequestDto {

  @ApiProperty({ example: "Vlad Emeliyanov" })
  @IsNotEmpty()
  @IsString()
  searchStr: string;

  @IsNotEmpty()
  @ApiProperty({ example: SearchUserType.friendsList })
  type: SearchUserType;
}