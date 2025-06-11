import { Module } from '@nestjs/common';
import { ConfigurationService } from 'src/app.common/services/config/configuration.service';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { MappingService } from 'src/app.common/services/mapping.service';
import { ErrorHandlingModule } from 'src/app.common/error-handling/error-handling.module';
import { LocalizationStringsService } from 'src/app.common/localization/localization-strings.service';
import { IconsService } from 'src/app.common/services/icons/icons.service';
import { LocalizationModule } from 'src/app.common/localization/localization-strings.module';

@Module({
  imports: [LocalizationModule, ErrorHandlingModule],
  controllers: [SettingsController],
  providers: [SettingsService, ConfigurationService, MappingService, IconsService],
})
export class SettingsModule {}