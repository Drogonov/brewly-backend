import { Module } from '@nestjs/common';
import { ConfigurationService } from 'src/app/common/services/config/configuration.service';
import { SamplesController } from './samples.controller';
import { SamplesService } from './samples.service';
import { ErrorHandlingModule } from 'src/app/common/error-handling/error-handling.module';
import { IconsService } from 'src/app/common/services/icons/icons.service';
import { MappingService } from 'src/app/common/services/mapping.service';
import { LocalizationOptionsListModule } from 'src/app/common/localization/localization-options-list/localization-options-list.module';
import { LocalizationModule } from 'src/app/common/localization/localization-strings.module';

@Module({
  imports: [LocalizationModule, ErrorHandlingModule, LocalizationOptionsListModule],
  controllers: [SamplesController],
  providers: [SamplesService, ConfigurationService, MappingService, IconsService],
})
export class SamplesModule {}