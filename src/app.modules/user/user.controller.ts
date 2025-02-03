import {
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';

import { UserService } from './user.service';
import { ISearchUsersResponse, SearchUsersResponseDto } from './dto';
import { GetCurrentUserCompanyId, GetCurrentUserId, Public } from 'src/app.common/decorators';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) { }

  @Get('search')
  @ApiOperation({ summary: 'Search for users' })
  @ApiOkResponse({ description: 'Returns DTO of the users from company', type: SearchUsersResponseDto })
  searchForUsers(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number,
    @Query('str') str: string,
  ): Promise<ISearchUsersResponse> {
    return this.userService.searchForUsers(userId, currentCompanyId, str);
  }
}