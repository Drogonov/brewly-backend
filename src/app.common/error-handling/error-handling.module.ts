import { Global, Module } from '@nestjs/common';
import { LocalizationStringsService } from '../localization/localization-strings-service';
import { ErrorHandlingService } from './error-handling.service';

@Global()
@Module({
  providers: [ErrorHandlingService, LocalizationStringsService],
  exports: [ErrorHandlingService],
})
export class ErrorHandlingModule {}