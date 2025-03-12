import { Module } from '@nestjs/common';
import { ConfigurationService } from 'src/app.common/services/config/configuration.service';
import { TestingController } from './testing.controller';
import { TestingService } from './testing.service';

@Module({
  imports: [],
  controllers: [TestingController],
  providers: [TestingService, ConfigurationService],
})
export class TestingModule {}