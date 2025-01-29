import { Module } from '@nestjs/common';
import { ConfigurationService } from 'src/app.services/config/configuration.service';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';

@Module({
  imports: [],
  controllers: [CompanyController],
  providers: [CompanyService, ConfigurationService],
})
export class CompanyModule {}