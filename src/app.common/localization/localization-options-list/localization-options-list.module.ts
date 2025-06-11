import { Global, Module } from '@nestjs/common';
import { LocalizationOptionsListService } from './localization-options-list.service';
import { LocalizationModule } from '../localization-strings.module';

@Global()
@Module({
  imports: [LocalizationModule],
  providers: [LocalizationOptionsListService],
  exports: [LocalizationOptionsListService],
})
export class LocalizationOptionsListModule { }