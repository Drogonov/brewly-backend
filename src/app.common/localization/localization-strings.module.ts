import { Global, Module } from "@nestjs/common";
import { I18nModule } from "nestjs-i18n";
import { LocalizationStringsService } from "./localization-strings.service";

@Global()
@Module({
  providers: [LocalizationStringsService],
  exports: [LocalizationStringsService],
})
export class LocalizationModule {}