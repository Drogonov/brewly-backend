import { Module } from '@nestjs/common';
import { ConfigurationService } from 'src/app.services/config/configuration.service';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  imports: [],
  controllers: [SettingsController],
  providers: [SettingsService, ConfigurationService],
})
export class SettingsModule {}