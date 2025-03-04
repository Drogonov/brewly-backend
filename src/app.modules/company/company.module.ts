import { Module } from '@nestjs/common';
import { ConfigurationService } from 'src/app.services/config/configuration.service';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { MappingService } from 'src/app.common/mapping-services/mapping.service';

@Module({
  imports: [],
  controllers: [CompanyController],
  providers: [CompanyService, ConfigurationService, MappingService],
})
export class CompanyModule {}