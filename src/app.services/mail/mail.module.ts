import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigurationService } from 'src/app.services/config/configuration.service';

@Global()
@Module({
  providers: [MailService, ConfigurationService],
  exports: [MailService],
})
export class MailModule {}