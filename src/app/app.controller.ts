import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('App')
@ApiBearerAuth('access-token')
@Controller('app')
export class AppController {
  constructor(private readonly appService: AppService) {}
}