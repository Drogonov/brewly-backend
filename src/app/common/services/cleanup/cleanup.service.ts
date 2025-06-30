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
    async handleSoftDeletedUsersCleanup() {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 14);

        try {
            const userResult = await this.prisma.user.deleteMany({
                where: { deletedAt: { lt: cutoff } },
            });
            this.logger.info(
                { count: userResult.count, cutoff: cutoff.toISOString() },
                'Hard-deleted soft-deleted users',
            );

            const companyResult = await this.prisma.company.deleteMany({
                where: { relatedToUsers: { none: {} } },
            });
            this.logger.info(
                { count: companyResult.count },
                'Hard-deleted companies with no user relations',
            );
        } catch (error) {
            this.logger.error(
                { error, cutoff: cutoff.toISOString() },
                'Cleanup failed for users and/or companies',
            );
        }
    }
}