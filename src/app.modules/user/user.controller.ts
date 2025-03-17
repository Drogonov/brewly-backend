import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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
  RequestTypeEnum,
  RejectUserSendedRequestRequest,
  ErrorResponseDto,
  OTPRequestDto
} from './dto';
import { GetCurrentUserCompanyId, GetCurrentUserId, Public } from 'src/app.common/decorators';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import { ResendNewEmailOTPRequest } from './dto/request/resend-new-email-otp.request.dto';

@ApiTags('user')
@ApiBearerAuth('access-token')
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
    @Body() dto: MakeUserActionRequest
  ): Promise<IStatusResponse> {
    return this.userService.makeUserAction(userId, currentCompanyId, dto);
  }

  @Post('reject')
  @ApiOperation({ summary: 'Reject user sended request' })
  @ApiOkResponse({ description: 'Returns status of user request rejection', type: StatusResponseDto })
  rejectUserSendedRequest(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number,
    @Body() dto: RejectUserSendedRequestRequest,
  ): Promise<IStatusResponse> {
    return this.userService.rejectUserSendedRequest(userId, currentCompanyId, dto);
  }

  @Post('edit')
  @ApiOperation({ summary: 'Edit user info' })
  @ApiOkResponse({ description: 'Returns DTO with status of edit operation', type: StatusResponseDto })
  saveEditUser(
    @GetCurrentUserId() userId: number,
    @Body() dto: SaveEditUserRequest
  ): Promise<IStatusResponse> {
    return this.userService.saveEditUser(userId, dto)
  }

  @Post('verify-new-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP to change users email' })
  @ApiOkResponse({ description: 'Returns status of email change', type: StatusResponseDto })
  @ApiUnprocessableEntityResponse({ description: 'Returns business top layer error', type: ErrorResponseDto })
  verifyNewEmail(
    @GetCurrentUserId() userId: number,
    @Body() dto: OTPRequestDto
  ): Promise<StatusResponseDto> {
    return this.userService.verifyNewEmail(userId, dto);
  }

  @Post('resend-new-email-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend OTP and update it for user' })
  @ApiOkResponse({ description: 'Returns operation status', type: StatusResponseDto })
  @ApiUnprocessableEntityResponse({ description: 'Returns business top layer error', type: ErrorResponseDto })
  resendNewEmailOTP(
    @GetCurrentUserId() userId: number,
    @Body() dto: ResendNewEmailOTPRequest
  ): Promise<StatusResponseDto> {
    return this.userService.resendNewEmailOTP(userId, dto.email);
  }
}