import { Module } from '@nestjs/common';
import { ConfigurationService } from 'src/app.services/config/configuration.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MappingService } from 'src/app.common/services/mapping.service';
import { CompanyRulesService } from 'src/app.common/services/company-rules.service';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService, ConfigurationService, MappingService, CompanyRulesService],
})
export class UserModule {}