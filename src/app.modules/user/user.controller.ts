import {
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';

import { UserService } from './user.service';
import { ISearchUsersResponse, SearchUsersResponseDto, SearchUsersRequestDto, SearchUserType, SearchUserResponseDto, GetUserRequestDto, GetUserResponseDto, IGetUserResponse } from './dto';
import { GetCurrentUserCompanyId, GetCurrentUserId, Public } from 'src/app.common/decorators';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) { }

  @Get('search')
  @ApiOperation({ summary: 'Search for users' })
  @ApiOkResponse({ description: 'Returns DTO with users search result array', type: SearchUsersResponseDto })
  searchForUsers(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number,
    @Query() dto: SearchUsersRequestDto
  ): Promise<ISearchUsersResponse> {
    return this.userService.searchForUsers(userId, currentCompanyId, dto);
  }

  @Get('list')
  @ApiOperation({ summary: 'Get Users list' })
  @ApiOkResponse({ description: 'Returns DTO with users list', type: SearchUsersResponseDto })
  getUsersList(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number,
    @Query('type') type: SearchUserType
  ): Promise<ISearchUsersResponse> {
    return this.userService.getUsersList(userId, currentCompanyId, type);
  }

  @Get('get')
  @ApiOperation({ summary: 'Get User' })
  @ApiOkResponse({ description: 'Returns DTO with user', type: GetUserResponseDto })
  getUser(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number,
    @Query() dto: GetUserRequestDto
  ): Promise<IGetUserResponse> {
    return this.userService.getUser(userId, currentCompanyId, dto);
  }
}