import { Global, Module } from '@nestjs/common';
import { LocalizationOptionsListService } from './localization-options-list.service';
import { LocalizationStringsService } from '../localization-strings.service';

@Global()
@Module({
  providers: [LocalizationOptionsListService, LocalizationStringsService],
  exports: [LocalizationOptionsListService],
})
export class LocalizationOptionsListModule {}