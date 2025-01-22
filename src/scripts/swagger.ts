import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../app/app.module';

async function generateSwagger() {
  const app = await NestFactory.create(AppModule);

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

  const fs = require('fs');
  fs.writeFileSync('./swagger.json', JSON.stringify(document, null, 2));

  await app.close();
}

generateSwagger();
