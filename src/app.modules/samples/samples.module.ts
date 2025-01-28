import { Module } from '@nestjs/common';
import { ConfigurationService } from 'src/app.services/config/configuration.service';
import { SamplesController } from './samples.controller';
import { SamplesService } from './samples.service';

@Module({
  imports: [],
  controllers: [SamplesController],
  providers: [SamplesService, ConfigurationService],
})
export class SamplesModule {}