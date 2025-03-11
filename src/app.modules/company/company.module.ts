import { Module } from '@nestjs/common';
import { ConfigurationService } from 'src/app.common/services/config/configuration.service';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { MappingService } from 'src/app.common/services/mapping.service';
import { CompanyRulesService } from 'src/app.common/services/company-rules.service';

@Module({
  imports: [],
  controllers: [CompanyController],
  providers: [CompanyService, ConfigurationService, MappingService, CompanyRulesService],
})
export class CompanyModule {}