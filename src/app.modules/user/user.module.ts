import { Module } from '@nestjs/common';
import { ConfigurationService } from 'src/app.common/services/config/configuration.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MappingService } from 'src/app.common/services/mapping.service';
import { CompanyRulesService } from 'src/app.common/services/company-rules.service';
import { ErrorHandlingModule } from 'src/app.common/error-handling/error-handling.module';
import { LocalizationStringsService } from 'src/app.common/localization/localization-strings-service';

@Module({
  imports: [ErrorHandlingModule],
  controllers: [UserController],
  providers: [UserService, ConfigurationService, MappingService, CompanyRulesService, LocalizationStringsService],
})
export class UserModule {}