import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configuration } from 'src/app.services/config/configuration';
import { validationSchema } from 'src/app.services/config/validationSchema';
import { ConfigurationModule } from 'src/app.services/config/configuration.module';
import { PrismaModule } from 'src/app.services/prisma/prisma.module';
import { AuthModule } from '../app.modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from 'src/app.common/guards';
import { JWTSessionModule } from 'src/app.services/jwt-session/jwt-session.module';
import { MailModule } from 'src/app.services/mail/mail.module';
import { OnboardingModule } from 'src/app.modules/onboarding/onboarding.module';
import { SettingsModule } from 'src/app.modules/settings/settings.module';
import { SamplesModule } from 'src/app.modules/samples/samples.module';
import { UserModule } from 'src/app.modules/user/user.module';
import { CompanyModule } from 'src/app.modules/company/company.module';
import { CuppingModule } from 'src/app.modules/cupping/cupping.module';
import { TestingModule } from '@nestjs/testing';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';

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
      loaderOptions: {
        path: `${process.cwd()}/src/i18n/`,
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
    ConfigurationModule,
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
  providers: [{
    provide: APP_GUARD,
    useClass: AtGuard,
  }],
})
export class AppModule { }
