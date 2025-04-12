import { Global, Module } from '@nestjs/common';
import { LocalizationStringsService } from '../localization/localization-strings.service';
import { LocalizationOptionsListService } from './localization-options-list.service';

@Global()
@Module({
  providers: [LocalizationOptionsListService, LocalizationStringsService],
  exports: [LocalizationOptionsListService],
})
export class LocalizationOptionsListModule {}