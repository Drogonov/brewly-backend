import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { configuration } from '../config/configuration';
import { validationSchema } from '../config/validationSchema';
import { ConfigurationModule } from '../config/configuration.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from '../common/guards';
import { JWTSessionModule } from '../jwt-session/jwt-session.module';
import { MailModule } from '../mail/mail.module';

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
