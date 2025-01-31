import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';

import { SettingsService } from './settings.service';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { GetCurrentUserId, GetCurrentUserCompanyId } from 'src/app.common/decorators';
import { GetDefaultCuppingSettingsResponseDto, GetUserSettingsResponseDto, IGetDefaultCuppingSettingsResponse, IGetUserSettingsResponse, IStatusResponse, SaveDefaultCuppingSettingsRequestDto, StatusResponseDto } from './dto';

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

  @Post('save-cupping-setings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save default cupping settings' })
  @ApiOkResponse({ description: 'Save new cupping settings', type: StatusResponseDto })
  saveDefaultCuppingSettings(@Body() dto: SaveDefaultCuppingSettingsRequestDto): Promise<IStatusResponse> {
    return this.settingsService.saveDefaultCuppingSettings(dto);
  }

  @Get('get-cupping-setings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get default cupping settings' })
  @ApiOkResponse({ description: 'Returns current default cupping settings', type: GetDefaultCuppingSettingsResponseDto })
  getDefaultCuppingSettings(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number
  ): Promise<IGetDefaultCuppingSettingsResponse> {
    return this.settingsService.getDefaultCuppingSettings(userId, currentCompanyId);
  }
}
