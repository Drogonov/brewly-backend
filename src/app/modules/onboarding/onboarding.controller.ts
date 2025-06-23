import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiController, Public } from 'src/app/common/decorators';
import { OnboardingResponseDto } from './dto';
import { OnboardingService } from './onboarding.service';

@ApiTags('api/onboarding')
@ApiController('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Public()
  @Get('page')
  @ApiOperation({ summary: 'Get Onboarding response' })
  @ApiOkResponse({ description: 'Returns a onboarding', type: OnboardingResponseDto })
  getOnboarding(): Promise<OnboardingResponseDto> {
    return this.onboardingService.getOnboarding();
  }
}