import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';

import { TestingService } from './testing.service';
import { Public } from 'src/app.common/decorators';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { GetCuppingSamplesRequestDto, GetCuppingSamplesResponseDto, IGetCuppingSamplesResponse } from './dto';

@Controller('testing')
export class TestingController {
  constructor(private testingService: TestingService) {}

    @Public()
    @Get('samples')
    @ApiOperation({ summary: 'Search for users' })
    @ApiOkResponse({ description: 'Returns DTO of the users from company', type: [GetCuppingSamplesResponseDto] })
    getCuppingSamples(@Query() dto: GetCuppingSamplesRequestDto): Promise<IGetCuppingSamplesResponse> {
      return this.testingService.getCuppingSamples(dto);
    }
}
