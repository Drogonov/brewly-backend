import {
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';

import { TestingService } from './testing.service';
import { Public } from 'src/app.common/decorators';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { GetCuppingSamplesRequestDto, GetCuppingSamplesResponseDto, IGetCuppingSamplesResponse, SaveCuppingTestsRequestDto } from './dto';
import { ISuccessIdResponse, SuccessIdResponseDto } from '../samples/dto';

@Controller('testing')
export class TestingController {
  constructor(private testingService: TestingService) {}

    @Public()
    @Get('samples')
    @ApiOperation({ summary: 'Get samples to test' })
    @ApiOkResponse({ description: 'Returns DTO of the samples to test', type: [GetCuppingSamplesResponseDto] })
    getCuppingSamples(@Query() dto: GetCuppingSamplesRequestDto): Promise<IGetCuppingSamplesResponse> {
      return this.testingService.getCuppingSamples(dto);
    }

    @Public()
    @Post('save')
    @ApiOperation({ summary: 'Save tested info' })
    @ApiOkResponse({ description: 'Returns DTO of the users from company', type: [SuccessIdResponseDto] })
    saveCuppingTestsResult(@Query() dto: SaveCuppingTestsRequestDto): Promise<ISuccessIdResponse> {
      return this.testingService.saveCuppingTestsResult(dto);
    }
}