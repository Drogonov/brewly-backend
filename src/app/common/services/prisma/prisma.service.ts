import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigurationService } from '../config/configuration.service';
import { createSoftDeleteMiddleware } from 'prisma-soft-delete-middleware';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  constructor(config: ConfigurationService) {
    super({
      datasources: { db: { url: config.getDatabaseURL() } },
    });

    this.$use(
      createSoftDeleteMiddleware({
        models: {
          User: {
            field: 'deletedAt',
            createValue: deleted => (deleted ? new Date() : null),
          },
        },
        // defaultConfig: {
        //   field: 'deletedAt',
        //   createValue: deleted => (deleted ? new Date() : null),
        // },
      }),
    );
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async softDeleteUser(id: number) {
    return this.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}