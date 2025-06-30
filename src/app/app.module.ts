import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configuration } from 'src/app/common/services/config/configuration';
import { validationSchema } from 'src/app/common/services/config/validationSchema';
import { ConfigurationModule } from 'src/app/common/services/config/configuration.module';
import { PrismaModule } from 'src/app/common/services/prisma/prisma.module';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from 'src/app/common/guards';
import { JWTSessionModule } from 'src/app/common/services/jwt-session/jwt-session.module';
import { MailModule } from 'src/app/common/services/mail/mail.module';
import { OnboardingModule } from 'src/app/modules/onboarding/onboarding.module';
import { SettingsModule } from 'src/app/modules/settings/settings.module';
import { SamplesModule } from 'src/app/modules/samples/samples.module';
import { UserModule } from 'src/app/modules/user/user.module';
import { CompanyModule } from 'src/app/modules/company/company.module';
import { CuppingModule } from 'src/app/modules/cupping/cupping.module';
import { AcceptLanguageResolver, CookieResolver, I18nJsonLoader, I18nModule, QueryResolver } from 'nestjs-i18n';
import { ErrorHandlingModule } from 'src/app/common/error-handling/error-handling.module';
import { LoggerModule, PinoLogger } from 'nestjs-pino';
import { LoggingInterceptor } from 'src/app/common/interceptor';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import path, { join } from 'path';
import { LocalizationModule } from 'src/app/common/localization/localization-strings.module';
import { APP_PIPE } from '@nestjs/core';
import { CustomValidationPipe } from 'src/app/common/error-handling/custom-validation-pipe';
import { LanguageUserBodyResolver } from 'src/app/common/localization/language-user-body.resolver';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TemplateModule } from 'src/app/common/services/template/template.module';
import { NotFoundModule } from './web/not-found/not-found.module';
import { PublicPagesModule } from './web/public-pages/public-pages.module';
import { AuthModule } from 'src/app/modules/auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CleanupService } from './common/services/cleanup/cleanup.service';
import { CleanupModule } from './common/services/cleanup/cleanup.module';

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
      fallbackLanguage: 'en',
      loader: I18nJsonLoader,
      loaderOptions: {
        path:
          process.env.NODE_ENV === 'production'
            ? join(process.cwd(), 'dist', 'i18n')
            : join(process.cwd(), 'src', 'i18n'),
        watch: false,
      },
      resolvers: [
        CookieResolver,
        LanguageUserBodyResolver,
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
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public')
    }),
    ScheduleModule.forRoot(),
    // core modules
    ConfigurationModule,
    LocalizationModule,
    ErrorHandlingModule,
    JWTSessionModule,
    TemplateModule,
    MailModule,
    PrismaModule,
    CleanupModule,

    // feature modules
    AuthModule,
    CompanyModule,
    CuppingModule,
    OnboardingModule,
    SamplesModule,
    SettingsModule,
    UserModule,

    // static modules
    PublicPagesModule,
    NotFoundModule,
  ],
  controllers: [],
  providers: [
    LanguageUserBodyResolver,
    { provide: APP_GUARD, useClass: AtGuard },
    { provide: APP_PIPE, useClass: CustomValidationPipe },
    PinoLogger,
    LoggingInterceptor,
  ],
})
export class AppModule { }
