import {
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';

import { SamplesService } from './samples.service';
import { Public } from 'src/app.common/decorators';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import {
  CoffeeTypeResponseDto,
  CreateCoffeeTypeRequestDto,
  CreateRoastTypeRequestDto,
  CreateSampleItemRequestDto,
  CreateSampleRequestDto,
  SampleResponseDto,
  CreateSampleTypeRequestDto,
  ICoffeeTypeResponse,
  ISampleResponse,
  IRoastTypeResponse,
  ISuccessIdResponse,
  RoastTypeResponseDto,
  SuccessIdResponseDto,
  SearchSampleTypeResponseDto,
  ISearchSampleTypeResponse
} from './dto';

@Controller('samples')
export class SamplesController {
  constructor(private sampleService: SamplesService) { }

  @Public()
  @Post('create/type')
  @ApiOperation({ summary: 'Create Sample Type' })
  @ApiOkResponse({ description: 'Returns id of the sample type after creation', type: SuccessIdResponseDto })
  createSampleType(@Body() dto: CreateSampleTypeRequestDto): Promise<ISuccessIdResponse> {
    return this.sampleService.createSampleType(dto);
  }

  @Public()
  @Post('create/item')
  @ApiOperation({ summary: 'Create Sample Item' })
  @ApiOkResponse({ description: 'Returns id of the sample item after creation', type: SuccessIdResponseDto })
  createSampleItem(@Body() dto: CreateSampleItemRequestDto): Promise<ISuccessIdResponse> {
    return this.sampleService.createSampleItem(dto);
  }

  @Public()
  @Post('create')
  @ApiOperation({ summary: 'Create Sample' })
  @ApiOkResponse({ description: 'Returns DTO of the sample after creation', type: SampleResponseDto })
  createSample(@Body() dto: CreateSampleRequestDto): Promise<ISampleResponse> {
    return this.sampleService.createSample(dto);
  }

  @Public()
  @Post('create/roasttype')
  @ApiOperation({ summary: 'Create Custom Roast Type' })
  @ApiOkResponse({ description: 'Returns DTO of the roast type after creation', type: RoastTypeResponseDto })
  createCustomRoastType(@Body() dto: CreateRoastTypeRequestDto): Promise<IRoastTypeResponse> {
    return this.sampleService.createCustomRoastType(dto);
  }

  @Public()
  @Get('get/roasttypes')
  @ApiOperation({ summary: 'Create Custom Roast Type' })
  @ApiOkResponse({ description: 'Returns DTO of the roast type after creation', type: [RoastTypeResponseDto] })
  getAvailiableRoastTypes(companyId: number): Promise<IRoastTypeResponse[]> {
    return this.sampleService.getAvailiableRoastTypes(companyId);
  }

  @Public()
  @Post('create/coffeetype')
  @ApiOperation({ summary: 'Create Custom Coffee Type' })
  @ApiOkResponse({ description: 'Returns DTO of the coffee type after creation', type: CoffeeTypeResponseDto })
  createCustomCoffeeType(@Body() dto: CreateCoffeeTypeRequestDto): Promise<ICoffeeTypeResponse> {
    return this.sampleService.createCustomCoffeeType(dto);
  }

  @Public()
  @Get('get/coffeetypes')
  @ApiOperation({ summary: 'Create Custom Coffee Type' })
  @ApiOkResponse({ description: 'Returns DTO of the coffee type after creation', type: [CoffeeTypeResponseDto] })
  getAvailiableCoffeeTypes(companyId: number): Promise<ICoffeeTypeResponse[]> {
    return this.sampleService.getAvailiableCoffeeTypes(companyId);
  }

  @Public()
  @Get('search/type')
  @ApiOperation({ summary: 'Search for coffee type from library' })
  @ApiOkResponse({ description: 'Returns DTO of the coffee types from library', type: [SearchSampleTypeResponseDto] })
  searchForSampleType(str: string): Promise<ISearchSampleTypeResponse[]> {
    return this.sampleService.searchForSampleType(str);
  }

  @Public()
  @Get('search/item')
  @ApiOperation({ summary: 'Search for coffee items from warehouse' })
  @ApiOkResponse({ description: 'Returns DTO of the coffee items from warehouse', type: [SearchSampleTypeResponseDto] })
  searchForSampleItem(str: string): Promise<ISearchSampleTypeResponse[]> {
    return this.sampleService.searchForSampleItem(str);
  }
}
