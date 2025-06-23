import { Module } from '@nestjs/common';
import { JWTSessionService } from './jwt-session.service';
import { PrismaService } from 'src/app/common/services/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigurationService } from 'src/app/common/services/config/configuration.service';

@Module({
  providers: [JWTSessionService, PrismaService, JwtService, ConfigurationService],
  exports: [JWTSessionService],
})
export class JWTSessionModule { }
