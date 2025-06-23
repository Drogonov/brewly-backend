import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetCurrentUserId, GetCurrentUserCompanyId, ApiController } from 'src/app.common/decorators';
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
  SaveCompanyRulesRequestDto,
  GetCompanyRulesRequestDto,
  GetCurrentCuppingSettingsResponseDto,
  IGetCurrentCuppingSettingsResponse
} from './dto';

@ApiTags('api/settings')
@ApiBearerAuth('access-token')
@ApiController('settings')
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

  @Post('save-cupping-settings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save default cupping settings' })
  @ApiOkResponse({ description: 'Save new cupping settings', type: StatusResponseDto })
  saveDefaultCuppingSettings(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number,
    @Body() dto: SaveDefaultCuppingSettingsRequestDto
  ): Promise<IStatusResponse> {
    return this.settingsService.saveDefaultCuppingSettings(userId, currentCompanyId, dto);
  }

  @Get('get-cupping-settings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get default cupping settings' })
  @ApiOkResponse({ description: 'Returns current default cupping settings', type: GetDefaultCuppingSettingsResponseDto })
  getDefaultCuppingSettings(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number
  ): Promise<IGetDefaultCuppingSettingsResponse> {
    return this.settingsService.getDefaultCuppingSettings(userId, currentCompanyId);
  }

  @Get('current-cupping-settings')
  @ApiOperation({ summary: 'Get Settings of the current cupping' })
  @ApiOkResponse({ description: 'Get Cupping settings', type: GetCurrentCuppingSettingsResponseDto })
  getCurrentCuppingSettings(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number
  ): Promise<IGetCurrentCuppingSettingsResponse> {
    return this.settingsService.getCurrentCuppingSettings(userId, currentCompanyId);
  }

  @Get('get-company-rules')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get availiable rules for user to change' })
  @ApiOkResponse({ description: 'Returns list of rules for user', type: GetCompanyRulesResponseDto })
  getCompanyRules(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number,
    @Query() dto: GetCompanyRulesRequestDto
  ): Promise<IGetCompanyRulesResponse> {
    return this.settingsService.getCompanyRules(dto.companyId)
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
    return this.settingsService.saveCompanyRules(dto)
  }
}
