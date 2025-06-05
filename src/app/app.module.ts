import { Module, Scope } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configuration } from 'src/app.common/services/config/configuration';
import { validationSchema } from 'src/app.common/services/config/validationSchema';
import { ConfigurationModule } from 'src/app.common/services/config/configuration.module';
import { PrismaModule } from 'src/app.common/services/prisma/prisma.module';
import { AuthModule } from '../app.modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from 'src/app.common/guards';
import { JWTSessionModule } from 'src/app.common/services/jwt-session/jwt-session.module';
import { MailModule } from 'src/app.common/services/mail/mail.module';
import { OnboardingModule } from 'src/app.modules/onboarding/onboarding.module';
import { SettingsModule } from 'src/app.modules/settings/settings.module';
import { SamplesModule } from 'src/app.modules/samples/samples.module';
import { UserModule } from 'src/app.modules/user/user.module';
import { CompanyModule } from 'src/app.modules/company/company.module';
import { CuppingModule } from 'src/app.modules/cupping/cupping.module';
import { TestingModule } from '@nestjs/testing';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { LocalizationStringsService } from 'src/app.common/localization/localization-strings.service';
import { ErrorHandlingModule } from 'src/app.common/error-handling/error-handling.module';
import { LoggerModule, PinoLogger } from 'nestjs-pino';
import { LoggingInterceptor } from 'src/interceptor';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import path, { join } from 'path';

@Module({
  imports: [
    // app.services
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/config/${process.env.NODE_ENV}.env`,
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    I18nModule.forRoot({
      loaderOptions: {
        path:
          process.env.NODE_ENV === 'production'
            ? join(process.cwd(), 'dist', 'i18n')
            : join(process.cwd(), 'src', 'i18n'),
        watch: false,
      },
      fallbackLanguage: 'en',
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        ...(process.env.NODE_ENV === 'production'
          ? {
            // ensure the directory exists (redundant with Dockerfile, but safe)
            stream: (() => {
              const logDir = '/var/log/brewly-backend';
              if (!existsSync(logDir)) {
                mkdirSync(logDir, { recursive: true });
              }
              return createWriteStream(join(logDir, 'app.log'), { flags: 'a' });
            })(),
            prettyPrint: false, // raw JSON only
          }
          : {
            // dev: pretty‐print to console
            transport: {
              target: 'pino-pretty',
              options: {
                colorize: true,
                levelFirst: true,
                translateTime: true,
              },
            },
          }),
      },
    }),
    ConfigurationModule,
    ErrorHandlingModule,
    JWTSessionModule,
    MailModule,
    PrismaModule,
    // app.modules
    AuthModule,
    CompanyModule,
    CuppingModule,
    OnboardingModule,
    SamplesModule,
    SettingsModule,
    TestingModule,
    UserModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
    LocalizationStringsService,
    PinoLogger,
    LoggingInterceptor,
  ],
})
export class AppModule { }
