import { Module } from '@nestjs/common';
import { ConfigurationService } from 'src/app.common/services/config/configuration.service';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { MappingService } from 'src/app.common/services/mapping.service';
import { CompanyRulesService } from 'src/app.common/services/company-rules.service';
import { ErrorHandlingModule } from 'src/app.common/error-handling/error-handling.module';
import { LocalizationStringsService } from 'src/app.common/localization/localization-strings-service';

@Module({
  imports: [ErrorHandlingModule],
  controllers: [CompanyController],
  providers: [CompanyService, ConfigurationService, MappingService, CompanyRulesService, LocalizationStringsService],
})
export class CompanyModule {}