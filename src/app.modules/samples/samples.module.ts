import { Module } from '@nestjs/common';
import { ConfigurationService } from 'src/app.common/services/config/configuration.service';
import { SamplesController } from './samples.controller';
import { SamplesService } from './samples.service';
import { ErrorHandlingModule } from 'src/app.common/error-handling/error-handling.module';
import { LocalizationStringsService } from 'src/app.common/localization/localization-strings.service';
import { IconsService } from 'src/app.common/services/icons/icons.service';
import { MappingService } from 'src/app.common/services/mapping.service';
import { LocalizationOptionsListModule } from 'src/app.common/localization/localization-options-list/localization-options-list.module';

@Module({
  imports: [ErrorHandlingModule, LocalizationOptionsListModule],
  controllers: [SamplesController],
  providers: [SamplesService, ConfigurationService, MappingService, LocalizationStringsService, IconsService],
})
export class SamplesModule {}