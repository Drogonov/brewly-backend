import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { configuration } from 'src/app.services/config/configuration';
import { validationSchema } from 'src/app.services/config/validationSchema';
import { ConfigurationModule } from 'src/app.services/config/configuration.module';
import { PrismaModule } from 'src/app.services/prisma/prisma.module';
import { AuthModule } from '../app.modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from 'src/app.services/common/guards';
import { JWTSessionModule } from 'src/app.services/jwt-session/jwt-session.module';
import { MailModule } from 'src/app.services/mail/mail.module';
import { OnboardingModule } from 'src/app.modules/onboarding/onboarding.module';
import { SettingsModule } from 'src/app.modules/settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/config/${process.env.NODE_ENV}.env`,
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    ConfigurationModule,
    AuthModule,
    OnboardingModule,
    SettingsModule,
    PrismaModule,
    JWTSessionModule,
    MailModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    }
  ],
})
export class AppModule { }
