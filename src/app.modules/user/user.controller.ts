import {
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';

import { UserService } from './user.service';
import {
  ISearchUsersResponse,
  SearchUsersResponseDto,
  SearchUsersRequestDto,
  SearchUserType,
  GetUserCardRequestDto,
  GetUserCardResponseDto,
  IGetUserCardResponse,
  StatusResponseDto,
  MakeUserActionRequest,
  IStatusResponse,
  UserInfoResponseDto,
  IUserInfoResponse,
  GetUserSendedRequestsResponseDto,
  IGetUserSendedRequestsResponse,
  GetUserNotificationsResponseDto,
  IGetUserNotificationsResponse,
  SaveEditUserRequest,
} from './dto';
import { GetCurrentUserCompanyId, GetCurrentUserId, Public } from 'src/app.common/decorators';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) { }

  @Get('search')
  @ApiOperation({ summary: 'Search for users' })
  @ApiOkResponse({ description: 'Returns DTO with users search result array', type: SearchUsersResponseDto })
  searchUsers(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number,
    @Query() dto: SearchUsersRequestDto
  ): Promise<ISearchUsersResponse> {
    return this.userService.searchUsers(userId, currentCompanyId, dto);
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

  @Get('get-card')
  @ApiOperation({ summary: 'Get User' })
  @ApiOkResponse({ description: 'Returns DTO with user', type: GetUserCardResponseDto })
  getUserCard(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number,
    @Query() dto: GetUserCardRequestDto
  ): Promise<IGetUserCardResponse> {
    return this.userService.getUserCard(userId, currentCompanyId, dto);
  }

  @Get('info')
  @ApiOperation({ summary: 'Get self User data' })
  @ApiOkResponse({ description: 'Returns DTO of the current user', type: UserInfoResponseDto })
  getUserInfo(
    @GetCurrentUserId() userId: number,
  ): Promise<IUserInfoResponse> {
    return this.userService.getUserInfo(userId);
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

  @Get('notifications')
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiOkResponse({ description: 'Returns DTO of the user notifications', type: GetUserNotificationsResponseDto })
  getUserNotifications(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number
  ): Promise<IGetUserNotificationsResponse> {
    return this.userService.getUserNotifications(userId, currentCompanyId);
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

  @Post('edit')
  @ApiOperation({ summary: 'Edit user info' })
  @ApiOkResponse({ description: 'Returns DTO with status of edit operation', type: StatusResponseDto })
  saveEditUser(
    @GetCurrentUserId() userId: number,
    @Query() dto: SaveEditUserRequest
  ): Promise<IStatusResponse> {
    return this.userService.saveEditUser(userId, dto)
  }
}