import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  // Create Fastify application
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }), // Disable fastify logger to use NestJS logger
  );
  
  const logger = new Logger('Bootstrap');
  
  // Register Fastify plugins
  await app.register(require('@fastify/cookie'), {
    secret: process.env.JWT_SECRET || 'my-secret-key', // for signed cookies
  });
  
  // Enable CORS with Fastify
  await app.register(require('@fastify/cors'), {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Remove properties that don't have decorators
    forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
    transform: true, // Transform payloads to be objects typed according to their DTO classes
    disableErrorMessages: false, // Enable detailed error messages
  }));
  
  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());
  
  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());
  
  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Adlaan Backend API')
    .setDescription('Enterprise-grade backend with authentication, company management, and subscriptions')
    .setVersion('1.0')
    .addCookieAuth('access_token', {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  
  const port = process.env.PORT ?? 4007;
  await app.listen(port, '0.0.0.0'); // Fastify requires explicit host binding
  
  logger.log(`🚀 Application running on: http://localhost:${port}`);
  logger.log(`📖 API Documentation: http://localhost:${port}/api-docs`);
  logger.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`⚡ Platform: Fastify (High Performance)`);
}
bootstrap();
