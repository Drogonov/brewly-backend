import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AtStrategy, RtStrategy } from './strategies';
import { ConfigurationService } from 'src/app.common/services/config/configuration.service';
import { JWTSessionService } from 'src/app.common/services//jwt-session/jwt-session.service';
import { MailService } from 'src/app.common/services/mail/mail.service';
import { LocalizationStringsService } from 'src/app.common/services/localization-strings-service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, AtStrategy, RtStrategy, ConfigurationService, JWTSessionService, MailService, LocalizationStringsService],
})
export class AuthModule {}
