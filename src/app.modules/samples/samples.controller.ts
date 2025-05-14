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
  GetSampleInfoResponseDto,
  IGetSampleCreationOptionsResponse,
  GetSampleCreationOptionsResponseDTO,
  GetCoffeePacksInfoResponseDto,
  IGetCoffeePacksInfoResponse
} from './dto';
import { ArchiveSampleDto } from './dto/archive-sample.request.dto';

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

  @Post('archive')
  @ApiOperation({ summary: 'Update Sample' })
  @ApiOkResponse({ description: 'Returns DTO with status of sample archiving', type: StatusResponseDto })
  archiveSample(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number,
    @Body() dto: ArchiveSampleDto
  ): Promise<IStatusResponse> {
    return this.sampleService.archiveSample(userId, currentCompanyId, dto);
  }

  @Get('sample-info')
  @ApiOperation({ summary: 'Get Sample type info' })
  @ApiOkResponse({ description: 'Returns DTO of the sample info', type: GetSampleInfoResponseDto })
  getSampleInfo(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number,
    @Query('sampleId', ParseIntPipe) sampleId: number
  ): Promise<IGetSampleInfoResponse> {
    return this.sampleService.getSampleInfo(userId, currentCompanyId, sampleId);
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

  @Get('creation-options')
  @ApiOperation({ summary: 'Get Sample Creation Options' })
  @ApiOkResponse({ description: 'Returns DTO with options for creating a sample', type: GetSampleCreationOptionsResponseDTO })
  getSampleCreationOptions(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number,
  ): Promise<IGetSampleCreationOptionsResponse> {
    return this.sampleService.getSampleCreationOptions(userId, currentCompanyId);
  }

  @Get('coffee-packs-info')
  @ApiOperation({ summary: 'Get Coffee packs' })
  @ApiOkResponse({ description: 'Returns DTO of the coffee packs by their ids', type: GetCoffeePacksInfoResponseDto })
  getCoffeePacksInfo(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number,
    @Query(
      'packsIds',
      new ParseArrayPipe({ items: Number, separator: ',' })
    )
    packsIds: number[],
  ): Promise<IGetCoffeePacksInfoResponse> {
    return this.sampleService.getCoffeePacksInfo(userId, currentCompanyId, packsIds);
  }
}