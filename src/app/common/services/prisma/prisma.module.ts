import { Global, Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigurationService } from '../config/configuration.service';
import { softDeleteUserExtension } from './prisma.extension';

@Global()
@Module({
  providers: [
    {
      provide: PrismaClient,
      useFactory: (config: ConfigurationService) =>
        new PrismaClient({
          datasources: { db: { url: config.getDatabaseURL() } },
        }).$extends(softDeleteUserExtension),
      inject: [ConfigurationService],
    },
  ],
  exports: [PrismaClient],
})
export class PrismaModule { }