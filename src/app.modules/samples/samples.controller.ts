import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';

import { SamplesService } from './samples.service';
import { GetCurrentUserCompanyId, GetCurrentUserId } from 'src/app.common/decorators';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  SampleRequestDto,
  IStatusResponse,
  StatusResponseDto,
  IGetSampleInfoResponse,
  IGetSampleTypesResponse,
  GetSampleTypesResponseDto,
  GetSampleInfoResponseDto
} from './dto';

@ApiTags('samples')
@ApiBearerAuth('access-token')
@Controller('samples')
export class SamplesController {
  constructor(private sampleService: SamplesService) { }

  @Post('create')
  @ApiOperation({ summary: 'Create Sample' })
  @ApiOkResponse({ description: 'Returns DTO of the sample after creation', type: StatusResponseDto })
  createSample(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number,
    @Body() dto: SampleRequestDto
  ): Promise<IStatusResponse> {
    return this.sampleService.createSample(userId, currentCompanyId, dto);
  }

  @Post('update')
  @ApiOperation({ summary: 'Update Sample' })
  @ApiOkResponse({ description: 'Returns DTO of the sample after update', type: StatusResponseDto })
  updateSample(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number,
    @Body() dto: SampleRequestDto
  ): Promise<IStatusResponse> {
    return this.sampleService.updateSample(userId, currentCompanyId, dto);
  }

  @Get('sample-info')
  @ApiOperation({ summary: 'Get Sample type info' })
  @ApiOkResponse({ description: 'Returns DTO of the sample info', type: GetSampleInfoResponseDto })
  getSampleInfo(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number,
    @Query('sampleId', ParseIntPipe) sampleId: number
  ): Promise<IGetSampleInfoResponse> {
    return this.sampleService.getSampleInfo(userId, currentCompanyId, sampleId)
  }

  @Get('types')
  @ApiOperation({ summary: 'Get Sample types' })
  @ApiOkResponse({ description: 'Returns DTO of the sample types with comments about warehouse packs storage', type: GetSampleTypesResponseDto })
  getSampleTypes(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number,
  ): Promise<IGetSampleTypesResponse> {
    return this.sampleService.getSampleTypes(userId, currentCompanyId);
  }
}
