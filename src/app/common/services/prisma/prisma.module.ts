// src/app/common/services/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { ConfigurationService } from '../config/configuration.service';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService, ConfigurationService],
  exports: [PrismaService],
})
export class PrismaModule { }