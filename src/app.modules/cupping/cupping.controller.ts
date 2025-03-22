import {
  Body,
  Controller,
  Get,
  Post,
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
  IGetCuppingsListResponse
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

@ApiTags('cupping')
@ApiBearerAuth('access-token')
@Controller('cupping')
export class CuppingController {
  constructor(private cuppingService: CuppingService) { }

  @Post('create')
  @ApiOperation({ summary: 'Create Cupping' })
  @ApiOkResponse({ description: 'Create Cupping with following DTO', type: SuccessIdResponseDto })
  getOnboarding(@Body() dto: CreateCuppingRequestDto): Promise<ISuccessIdResponse> {
    return this.cuppingService.createCupping(dto);
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

  @Post('results')
  @ApiOperation({ summary: 'Create Cupping' })
  @ApiOkResponse({ description: 'Create Cupping with following DTO', type: GetCuppingResultsResponseDto })
  getCuppingResult(@Body() dto: GetCuppingResultsRequestDto): Promise<IGetCuppingResultsResponse> {
    return this.cuppingService.getCuppingResult(dto);
  }
}