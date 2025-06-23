import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AtStrategy, RtStrategy } from './strategies';
import { JWTSessionService } from 'src/app.common/services//jwt-session/jwt-session.service';
import { MailService } from 'src/app.common/services/mail/mail.service';
import { ErrorHandlingModule } from 'src/app.common/error-handling/error-handling.module';
import { PinoLogger } from 'nestjs-pino';
import { LocalizationModule } from 'src/app.common/localization/localization-strings.module';
import { ConfigurationService } from 'src/app.common/services/config/configuration.service';

@Module({
  imports: [JwtModule.register({}), LocalizationModule, ErrorHandlingModule],
  controllers: [AuthController],
  providers: [AuthService, AtStrategy, RtStrategy, ConfigurationService, JWTSessionService, MailService, PinoLogger],
})
export class AuthModule {}