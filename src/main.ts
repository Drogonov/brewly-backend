import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigurationService } from 'src/app.services/config/configuration.service';
import { CustomValidationPipe } from 'src/app.common/custom-validation-pipe';
import { AllExceptionsFilter } from 'src/app.common/exceptions/all-exceptions.filter';
import { LocalizationStringsService } from 'src/app.services/services/localization-strings-service';
import { ErrorHandlingService } from 'src/app.services/services/error-handling.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigurationService);
  const localizationService = app.get(LocalizationStringsService);
  const errorHandlingService = app.get(ErrorHandlingService);

  // Use our custom validation pipe globally.
  app.useGlobalPipes(new CustomValidationPipe(localizationService));

  // Use our global exception filter.
  app.useGlobalFilters(new AllExceptionsFilter(localizationService, errorHandlingService));

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