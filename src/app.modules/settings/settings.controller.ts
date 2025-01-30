import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { SettingsService } from './settings.service';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { GetCurrentUserId, GetCurrentUserCompanyId } from 'src/app.common/decorators';
import { GetUserSettingsResponseDto, IGetUserSettingsResponse } from './dto';

@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) { }

  @Get('user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user settings' })
  @ApiOkResponse({ description: 'Returns detailed about availiable user settings', type: GetUserSettingsResponseDto })
  getUserSettings(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number
  ): Promise<IGetUserSettingsResponse> {
    return this.settingsService.getUserSettings(userId, currentCompanyId);
  }
  
}
