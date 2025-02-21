import {
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';

import { UserService } from './user.service';
import { ISearchUsersResponse, SearchUsersResponseDto, SearchUsersRequestDto, SearchUserType, SearchUserResponseDto, GetUserRequestDto, GetUserResponseDto, IGetUserResponse, StatusResponseDto, MakeUserActionRequest, IStatusResponse, GetUserSendedRequestsResponseDto, IGetUserSendedRequestsResponse, GetUserNotificationsResponseDto, IGetUserNotificationsResponse } from './dto';
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

  @Post('action')
  @ApiOperation({ summary: 'Some action made by user' })
  @ApiOkResponse({ description: 'Returns status of user interaction', type: StatusResponseDto })
  makeUserAction(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number,
    @Query() dto: MakeUserActionRequest
  ): Promise<IStatusResponse> {
    return this.userService.makeUserAction(userId, currentCompanyId, dto);
  }

  @Get('requests')
  @ApiOperation({ summary: 'Get user sended requests' })
  @ApiOkResponse({ description: 'Returns DTO of the requests sended by user', type: GetUserSendedRequestsResponseDto })
  getUserSendedRequests(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number
  ): Promise<IGetUserSendedRequestsResponse> {
    return this.userService.getUserSendedRequests(userId, currentCompanyId);
  }

  @Post('reject')
  @ApiOperation({ summary: 'Reject user sended request' })
  @ApiOkResponse({ description: 'Returns status of user request rejection', type: StatusResponseDto })
  rejectUserSendedRequest(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number,
    @Query('requestId') requestId: number
  ): Promise<IStatusResponse> {
    return this.userService.rejectUserSendedRequest(userId, currentCompanyId, requestId);
  }

  @Get('notifications')
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiOkResponse({ description: 'Returns DTO of the user notifications', type: GetUserNotificationsResponseDto })
  getUserNotifications(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number
  ): Promise<IGetUserNotificationsResponse> {
    return this.userService.getUserNotifications(userId, currentCompanyId);
  }  
}