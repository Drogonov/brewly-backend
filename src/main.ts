import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { ConfigurationService } from './config/configuration.service';
import { CustomValidationPipe } from './common/custom-validation-pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigurationService);

  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true,
  //   }),
  // );

  app.useGlobalPipes(new CustomValidationPipe());


  if (configService.getAppPort() !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('App API')
      .setDescription('API documentation for the application')
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'access-token'
      )
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'refresh-token'
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
  }

  const appPort = configService.getAppPort();
  await app.listen(appPort || 3000);
  
}
bootstrap();