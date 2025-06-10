import { Module } from '@nestjs/common';
import { ConfigurationService } from 'src/app.common/services/config/configuration.service';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { LocalizationStringsService } from 'src/app.common/localization/localization-strings.service';

@Module({
  controllers: [OnboardingController],
  providers: [OnboardingService, ConfigurationService, LocalizationStringsService],
})
export class OnboardingModule {}