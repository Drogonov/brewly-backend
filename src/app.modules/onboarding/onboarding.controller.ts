import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/app.common/decorators';
import { OnboardingResponseDto } from './dto';
import { OnboardingService } from './onboarding.service';

@ApiTags('App')
@ApiBearerAuth('access-token')
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Public()
  @Post('page')
  @ApiOperation({ summary: 'Get Onboarding response' })
  @ApiOkResponse({ description: 'Returns a onboarding', type: OnboardingResponseDto })
  getOnboarding(pageNumber?: number): Promise<OnboardingResponseDto> {
    return this.onboardingService.getOnboarding(pageNumber);
  }
}