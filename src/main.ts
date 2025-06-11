import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigurationService } from 'src/app.common/services/config/configuration.service';
import { CustomValidationPipe } from 'src/app.common/error-handling/custom-validation-pipe';
import { ErrorHandlingService } from 'src/app.common/error-handling/error-handling.service';
import { LoggingInterceptor } from './interceptor';
import * as bodyParser from 'body-parser';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  
  const configService = app.get(ConfigurationService);
  const errorHandlingService = app.get(ErrorHandlingService);

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
    app.useGlobalPipes(new CustomValidationPipe(errorHandlingService));
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