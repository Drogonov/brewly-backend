import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ConfigurationService } from '../config/configuration.service';

@Global()
@Module({
  providers: [PrismaService, ConfigurationService],
  exports: [PrismaService],
})
export class PrismaModule { }
