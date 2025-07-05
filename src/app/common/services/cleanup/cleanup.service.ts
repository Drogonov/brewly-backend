import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/app/common/services/prisma/prisma.service';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class CleanupService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly logger: PinoLogger,
    ) {
        this.logger.setContext(CleanupService.name);
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
        timeZone: 'Europe/Moscow',
    })

    async handleSoftDeletedUsersCleanup() {}
}