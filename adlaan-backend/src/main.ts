// Polyfill for crypto.randomUUID() in Node.js < 19
const { webcrypto } = require('crypto');
if (!global.crypto) {
  global.crypto = webcrypto;
}

import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 4001);
}
bootstrap();
