import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';

import { SettingsService } from './settings.service';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { GetCurrentUserId, GetCurrentUserCompanyId } from 'src/app.common/decorators';
import {
  GetDefaultCuppingSettingsResponseDto,
  GetUserSettingsResponseDto,
  IGetDefaultCuppingSettingsResponse,
  IGetUserSettingsResponse,
  IStatusResponse,
  SaveDefaultCuppingSettingsRequestDto,
  StatusResponseDto,
  GetCompanyRulesResponseDto,
  IGetCompanyRulesResponse,
  SaveCompanyRulesRequestDto
} from './dto';

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

  @Get('get-company-rules')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get availiable rules for user to change' })
  @ApiOkResponse({ description: 'Returns list of rules for user', type: GetCompanyRulesResponseDto })
  getCompanyRules(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number
  ): Promise<IGetCompanyRulesResponse> {
    return this.settingsService.getCompanyRules(userId, currentCompanyId)
  }

  @Post('save-company-rules')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save rules for the company' })
  @ApiOkResponse({ description: 'Save list of changed fules by user', type: StatusResponseDto })
  saveCompanyRules(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number,
    @Body() dto: SaveCompanyRulesRequestDto
  ): Promise<IStatusResponse> {
    return this.settingsService.saveCompanyRules(userId, currentCompanyId, dto)
  }
}
