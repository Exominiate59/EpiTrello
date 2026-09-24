import 'reflect-metadata';
import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { assertEnv } from './config';

async function bootstrap() {
  assertEnv();
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true });
  // Validation globale des DTO : rejette les champs inconnus et renvoie des messages clairs
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
