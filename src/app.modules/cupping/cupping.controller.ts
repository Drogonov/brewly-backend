import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';

import { CuppingService } from './cupping.service';
import { CreateCuppingRequestDto, GetCuppingResultsRequestDto, GetCuppingResultsResponseDto, IGetCuppingResultsResponse, ISuccessIdResponse, SuccessIdResponseDto } from './dto';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Public } from 'src/app.common/decorators';

@Controller('cupping')
export class CuppingController {
  constructor(private cuppingService: CuppingService) { }

  @Public()
  @Post('create')
  @ApiOperation({ summary: 'Create Cupping' })
  @ApiOkResponse({ description: 'Create Cupping with following DTO', type: SuccessIdResponseDto })
  getOnboarding(@Body() dto: CreateCuppingRequestDto): Promise<ISuccessIdResponse> {
    return this.cuppingService.createCupping(dto);
  }

  @Public()
  @Post('results')
  @ApiOperation({ summary: 'Create Cupping' })
  @ApiOkResponse({ description: 'Create Cupping with following DTO', type: GetCuppingResultsResponseDto })
  getCuppingResult(@Body() dto: GetCuppingResultsRequestDto): Promise<IGetCuppingResultsResponse> {
    return this.cuppingService.getCuppingResult(dto);
  }
}