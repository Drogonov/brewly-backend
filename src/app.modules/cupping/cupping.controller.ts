import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
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
  IGetCuppingResponse
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
import { IStatusResponse } from '../auth/dto';

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

  @Post('get-cupping')
  @ApiOperation({ summary: 'Start Cupping' })
  @ApiOkResponse({ description: 'Start cupping with your friends', type: GetCuppingResponseDto })
  getCupping(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number,
    @Query('cuppingId', ParseIntPipe) cuppingId: number
  ): Promise<IGetCuppingResponse> {
    return this.cuppingService.getCupping(userId, currentCompanyId, cuppingId);
  }
}