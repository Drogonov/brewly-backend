import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AtStrategy, RtStrategy } from './strategies';
import { ConfigurationService } from 'src/app.common/services/config/configuration.service';
import { JWTSessionService } from 'src/app.common/services//jwt-session/jwt-session.service';
import { MailService } from 'src/app.common/services/mail/mail.service';
import { ErrorHandlingModule } from 'src/app.common/error-handling/error-handling.module';
import { PinoLogger } from 'nestjs-pino';

@Module({
  imports: [JwtModule.register({}), ErrorHandlingModule],
  controllers: [AuthController],
  providers: [AuthService, AtStrategy, RtStrategy, ConfigurationService, JWTSessionService, MailService, PinoLogger],
})
export class AuthModule {}