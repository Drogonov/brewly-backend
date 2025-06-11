import { Global, Module } from '@nestjs/common';
import { ErrorHandlingService } from './error-handling.service';
import { LocalizationModule } from '../localization/localization-strings.module';

@Global()
@Module({
  imports: [LocalizationModule],
  providers: [ErrorHandlingService],
  exports: [ErrorHandlingService],
})
export class ErrorHandlingModule {}