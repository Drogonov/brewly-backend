import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class CleanupService {
    private readonly logger = new Logger(CleanupService.name);

    constructor(private readonly prisma: PrismaClient) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
        timeZone: 'Europe/Amsterdam',
    })
    async handleSoftDeletedUsersCleanup() {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 14);

        try {
            const result = await this.prisma.user.deleteMany({
                where: { deletedAt: { lt: cutoff } },
            });
            this.logger.log(
                `Hard-deleted ${result.count} users soft-deleted before ${cutoff.toISOString()}`,
            );
        } catch (error) {
            this.logger.error(
                `Failed to clean up soft-deleted users older than ${cutoff.toISOString()}`,
                error as any,
            );
        }
    }
}