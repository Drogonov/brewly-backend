import { Module } from '@nestjs/common';
import { ConfigurationService } from 'src/app.services/config/configuration.service';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';

@Module({
  imports: [],
  controllers: [OnboardingController],
  providers: [OnboardingService, ConfigurationService],
})
export class OnboardingModule {}