import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AtStrategy, RtStrategy } from './strategies';
import { ConfigurationService } from 'src/config/configuration.service';
import { JWTSessionService } from 'src/jwt-session/jwt-session.service';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, AtStrategy, RtStrategy, ConfigurationService, JWTSessionService, MailService],
})
export class AuthModule {}
