import { Module } from '@nestjs/common';
import { ConfigurationService } from 'src/app.services/config/configuration.service';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { MappingService } from 'src/app.common/mapping-services/mapping.service';

@Module({
  imports: [],
  controllers: [SettingsController],
  providers: [SettingsService, ConfigurationService, MappingService],
})
export class SettingsModule {}