import { Module } from '@nestjs/common';
import { ConfigurationService } from 'src/app.common/services/config/configuration.service';
import { CuppingController } from './cupping.controller';
import { CuppingService } from './cupping.service';

@Module({
  imports: [],
  controllers: [CuppingController],
  providers: [CuppingService, ConfigurationService],
})
export class CuppingModule {}