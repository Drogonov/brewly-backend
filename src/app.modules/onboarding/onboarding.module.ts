import { Module } from '@nestjs/common';
import { ConfigurationService } from 'src/app.common/services/config/configuration.service';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { LocalizationModule } from 'src/app.common/localization/localization-strings.module';

@Module({
  imports: [LocalizationModule],
  controllers: [OnboardingController],
  providers: [OnboardingService, ConfigurationService],
})
export class OnboardingModule {}