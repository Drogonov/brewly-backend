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
  CreateSampleRequestDto,
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

  // @Public()
  // @Post('create/type')
  // @ApiOperation({ summary: 'Create Sample Type' })
  // @ApiOkResponse({ description: 'Returns id of the sample type after creation', type: SuccessIdResponseDto })
  // createSampleType(@Body() dto: CreateSampleTypeRequestDto): Promise<ISuccessIdResponse> {
  //   return this.sampleService.createSampleType(dto);
  // }

  // @Public()
  // @Post('create/item')
  // @ApiOperation({ summary: 'Create Sample Item' })
  // @ApiOkResponse({ description: 'Returns id of the sample item after creation', type: SuccessIdResponseDto })
  // createSampleItem(@Body() dto: CreateSampleItemRequestDto): Promise<ISuccessIdResponse> {
  //   return this.sampleService.createSampleItem(dto);
  // }

  @Post('create')
  @ApiOperation({ summary: 'Create Sample' })
  @ApiOkResponse({ description: 'Returns DTO of the sample after creation', type: StatusResponseDto })
  createSample(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number,
    @Body() dto: CreateSampleRequestDto
  ): Promise<IStatusResponse> {
    return this.sampleService.createSample(userId, currentCompanyId, dto);
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


  // @Public()
  // @Post('create/roasttype')
  // @ApiOperation({ summary: 'Create Custom Roast Type' })
  // @ApiOkResponse({ description: 'Returns DTO of the roast type after creation', type: RoastTypeResponseDto })
  // createCustomRoastType(@Body() dto: CreateRoastTypeRequestDto): Promise<IRoastTypeResponse> {
  //   return this.sampleService.createCustomRoastType(dto);
  // }

  // @Public()
  // @Get('get/roasttypes')
  // @ApiOperation({ summary: 'Create Custom Roast Type' })
  // @ApiOkResponse({ description: 'Returns DTO of the roast type after creation', type: [RoastTypeResponseDto] })
  // getAvailiableRoastTypes(companyId: number): Promise<IRoastTypeResponse[]> {
  //   return this.sampleService.getAvailiableRoastTypes(companyId);
  // }

  // @Public()
  // @Post('create/coffeetype')
  // @ApiOperation({ summary: 'Create Custom Coffee Type' })
  // @ApiOkResponse({ description: 'Returns DTO of the coffee type after creation', type: CoffeeTypeResponseDto })
  // createCustomCoffeeType(@Body() dto: CreateCoffeeTypeRequestDto): Promise<ICoffeeTypeResponse> {
  //   return this.sampleService.createCustomCoffeeType(dto);
  // }

  // @Public()
  // @Get('get/coffeetypes')
  // @ApiOperation({ summary: 'Create Custom Coffee Type' })
  // @ApiOkResponse({ description: 'Returns DTO of the coffee type after creation', type: [CoffeeTypeResponseDto] })
  // getAvailiableCoffeeTypes(companyId: number): Promise<ICoffeeTypeResponse[]> {
  //   return this.sampleService.getAvailiableCoffeeTypes(companyId);
  // }

  // @Public()
  // @Get('search/type')
  // @ApiOperation({ summary: 'Search for coffee type from library' })
  // @ApiOkResponse({ description: 'Returns DTO of the coffee types from library', type: [SearchSampleTypeResponseDto] })
  // searchForSampleType(str: string): Promise<ISearchSampleTypeResponse[]> {
  //   return this.sampleService.searchForSampleType(str);
  // }

  // @Public()
  // @Get('search/item')
  // @ApiOperation({ summary: 'Search for coffee items from warehouse' })
  // @ApiOkResponse({ description: 'Returns DTO of the coffee items from warehouse', type: [SearchSampleTypeResponseDto] })
  // searchForSampleItem(str: string): Promise<ISearchSampleTypeResponse[]> {
  //   return this.sampleService.searchForSampleItem(str);
  // }
}
