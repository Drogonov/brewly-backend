import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigurationService } from 'src/app.common/services/config/configuration.service';
import { ErrorHandlingModule } from 'src/app.common/error-handling/error-handling.module';

@Global()
@Module({
  imports: [ErrorHandlingModule],
  providers: [MailService, ConfigurationService],
  exports: [MailService],
})
export class MailModule {}