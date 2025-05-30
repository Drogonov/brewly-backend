import {
  Body,
  Controller,
  Get,
  ParseArrayPipe,
  ParseIntPipe,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { CuppingService } from './cupping.service';
import {
  CreateCuppingRequestDto,
  GetCuppingResultsRequestDto,
  GetCuppingResultsResponseDto,
  IGetCuppingResultsResponse,
  ISuccessIdResponse,
  SuccessIdResponseDto,
  GetCuppingsListResponseDto,
  IGetCuppingsListResponse,
  GetCuppingResponseDto,
  IGetCuppingResponse,
  SetCuppingStatusRequestDto,
  SetCuppingTestsRequestDto,
  CuppingStatus,
  IGetCuppingStatusResponse,
  GetCuppingStatusResponseDto
} from './dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger';
import {
  GetCurrentUserCompanyId,
  GetCurrentUserId,
} from 'src/app.common/decorators';
import { IStatusResponse, StatusResponseDto } from '../auth/dto';

@ApiTags('cupping')
@ApiBearerAuth('access-token')
@Controller('cupping')
export class CuppingController {
  constructor(private cuppingService: CuppingService) { }

  @Post('create')
  @ApiOperation({ summary: 'Create Cupping' })
  @ApiOkResponse({ description: 'Create Cupping with following DTO', type: SuccessIdResponseDto })
  createCupping(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number,
    @Body() dto: CreateCuppingRequestDto
  ): Promise<IStatusResponse> {
    return this.cuppingService.createCupping(userId, currentCompanyId, dto);
  }

  @Get('list')
  @ApiOperation({ summary: 'Get cuppings list' })
  @ApiOkResponse({ description: 'Get list of the all user cuppings', type: GetCuppingsListResponseDto })
  getCuppingsList(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number
  ): Promise<IGetCuppingsListResponse> {
    return this.cuppingService.getCuppingsList(userId, currentCompanyId);
  }

  @Get('get-cupping')
  @ApiOperation({ summary: 'Get Cupping' })
  @ApiOkResponse({ description: 'Get cupping info', type: GetCuppingResponseDto })
  getCupping(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number,
    @Query('cuppingId', ParseIntPipe) cuppingId: number
  ): Promise<IGetCuppingResponse> {
    return this.cuppingService.getCupping(userId, currentCompanyId, cuppingId);
  }

  @Get('get-cupping-status')
  @ApiOperation({ summary: 'Get Cupping status' })
  @ApiOkResponse({ description: 'Get cupping status after some changes', type: GetCuppingStatusResponseDto })
  getCuppingStatus(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number,
    @Query('cuppingId', ParseIntPipe) cuppingId: number
  ): Promise<IGetCuppingStatusResponse> {
    return this.cuppingService.getCuppingStatus(userId, currentCompanyId, cuppingId);
  }

  @Post('set-cupping-status')
  @ApiOperation({ summary: 'Set Cupping status by user who has permissions' })
  @ApiOkResponse({ description: 'Get cupping status', type: StatusResponseDto })
  setCuppingStatus(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number,
    @Body() dto: SetCuppingStatusRequestDto
  ): Promise<IStatusResponse> {
    return this.cuppingService.setCuppingStatus(userId, currentCompanyId, dto);
  }

  @Post('set-cupping-test')
  @ApiOperation({ summary: 'Set Cupping tests' })
  @ApiOkResponse({ description: 'Set cupping test info by user', type: StatusResponseDto })
  setCuppingTests(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number,
    @Body() dto: SetCuppingTestsRequestDto
  ): Promise<IStatusResponse> {
    return this.cuppingService.setCuppingTests(userId, currentCompanyId, dto);
  }
}