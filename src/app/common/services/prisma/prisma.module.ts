import { Global, Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigurationService } from '../config/configuration.service';
import { createSoftDeleteMiddleware } from 'prisma-soft-delete-middleware';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [
    {
      provide: PrismaClient,
      useFactory: (config: ConfigurationService) => {
        const client = new PrismaClient({
          datasources: { db: { url: config.getDatabaseURL() } },
        });

        client.$use(
          createSoftDeleteMiddleware({
            models: {
              User: {
                field: 'deletedAt',
                createValue: deleted => deleted
                  ? new Date()
                  : null,
                allowCompoundUniqueIndexWhere: true
              },
            },
            // defaultConfig: {
            //   field: 'deletedAt',
            //   createValue: deleted => deleted ? new Date() : null,
            // },
          }),
        );

        return client;
      },
      inject: [ConfigurationService],
    },
  ],
  exports: [PrismaClient, PrismaService],
})
export class PrismaModule { }