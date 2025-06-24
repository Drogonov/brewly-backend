import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigurationService } from 'src/app/common/services/config/configuration.service';
import { LoggingInterceptor } from './app/common/interceptor';
import * as bodyParser from 'body-parser';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app/app.module';
import { join } from 'path';
import { engine } from 'express-handlebars';
import cookieParser from 'cookie-parser';
import * as Handlebars from 'handlebars';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    { bufferLogs: true },
  );
  const configService = app.get(ConfigurationService);

  app.useLogger(app.get(Logger));

  app.setBaseViewsDir(join(__dirname, 'app', 'web', 'views'));
  app.engine(
    'hbs',
    engine({
      extname: '.hbs',
      layoutsDir: join(__dirname, 'app', 'web', 'views', 'layouts'),
      partialsDir: join(__dirname, 'app', 'web', 'views', 'partials'),
      defaultLayout: 'main',
    }),
  );
  app.setViewEngine('hbs');

  app.use(cookieParser());
  app.use((req, res, next) => {
    if (req.query.lang) {
      res.cookie('lang', req.query.lang, { path: '/', maxAge: 365 * 24 * 60 * 60 * 1000 });
    }
    next();
  });
  Handlebars.registerHelper('eq', (a, b) => a === b);

  // Only use your req/res interceptor in development
  if (configService.getEnv() === 'development') {
    app.use(
      bodyParser.json({
        verify: (req, res, buf: Buffer) => {
          (req as any).rawBody = buf.toString();
        },
      })
    );

    app.useGlobalInterceptors(app.get(LoggingInterceptor));
  }

  if (configService.getAppPort() !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('App API')
      .setDescription('API documentation for the application')
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'refresh-token')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
  }

  const appPort = configService.getAppPort();
  await app.listen(appPort || 3000);
}
bootstrap();