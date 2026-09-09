import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators';
import { PrismaService } from '../common/services/prisma/prisma.service';

@Controller('health')
@Public()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('live')
  live() {
    return { status: 'ok' };
  }

  @Get('ready')
  async ready() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok' };
  }
}
