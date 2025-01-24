import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators';
import { OnboardingResponseDto } from './dto';

@ApiTags('App')
@ApiBearerAuth('access-token')
@Controller('app')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Post('onboarding')
  @ApiOperation({ summary: 'Get Onboarding response' })
  @ApiOkResponse({ description: 'Returns a onboarding', type: OnboardingResponseDto })
  getOnboarding(): Promise<OnboardingResponseDto> {
    return this.appService.getOnboarding();
  }
}