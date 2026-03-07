import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

import { env } from '@config';
import { LoggerService } from '@core/logger';

import { AppModule } from './app.module';
import { cleanupOpenApiDoc } from 'nestjs-zod';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get(LoggerService);
  app.useLogger(logger);

  // OpenAPI configuration
  const config = new DocumentBuilder()
    .setTitle('Dream Analyzer API')
    .setDescription('Dream Analyzer API - Multilanguage & OpenAPI Compatible')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addGlobalParameters({
      name: 'Accept-Language',
      in: 'header',
      required: false,
      description: 'Language preference (en, tr)',
      schema: {
        type: 'string',
        enum: ['en', 'tr'],
        default: 'en',
      },
    })
    .addTag('user', 'User profile endpoints')
    .addTag('dream', 'Dream analysis endpoints')
    .addTag('subscription', 'Subscription management endpoints')
    .addTag('insight', 'Insights and articles endpoints')
    .addTag('faq', 'FAQ endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // OpenAPI JSON endpoint
  SwaggerModule.setup('api/docs', app, cleanupOpenApiDoc(document), {
    jsonDocumentUrl: '/api/openapi.json',
  });

  // Scalar API Reference
  app.use(
    '/api/reference',
    apiReference({
      url: '/api/openapi.json',
      theme: 'kepler',
    }),
  );

  const port = env.PORT;
  await app.listen(port);

  logger.log(
    `🚀 Application is running on: http://localhost:${port}`,
    'Bootstrap',
  );
  logger.log(
    `📚 Scalar API Reference: http://localhost:${port}/api/reference`,
    'Bootstrap',
  );
  logger.log(
    `📄 OpenAPI JSON: http://localhost:${port}/api/openapi.json`,
    'Bootstrap',
  );
}

void bootstrap();
