import { Module } from '@nestjs/common';
import { ConfigurationService } from 'src/app.common/services/config/configuration.service';
import { CuppingController } from './cupping.controller';
import { CuppingService } from './cupping.service';
import { MappingService } from 'src/app.common/services/mapping.service';
import { LocalizationStringsService } from 'src/app.common/localization/localization-strings.service';
import { ErrorHandlingModule } from 'src/app.common/error-handling/error-handling.module';
import { LocalizationModule } from 'src/app.common/localization/localization-strings.module';

@Module({
  imports: [LocalizationModule, ErrorHandlingModule],
  controllers: [CuppingController],
  providers: [CuppingService, ConfigurationService, MappingService],
})
export class CuppingModule {}