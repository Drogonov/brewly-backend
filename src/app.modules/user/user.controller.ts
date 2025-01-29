import {
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';

import { UserService } from './user.service';
import { ISearchUserResponse, SearchUserRequestDto, SearchUserResponseDto } from './dto';
import { Public } from 'src/app.common/decorators';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

    @Public()
    @Get('search')
    @ApiOperation({ summary: 'Search for users' })
    @ApiOkResponse({ description: 'Returns DTO of the users from company', type: [SearchUserResponseDto] })
    createCustomRoastType(@Query() dto: SearchUserRequestDto): Promise<ISearchUserResponse[]> {
      return this.userService.searchForUsers(dto);
    }
}