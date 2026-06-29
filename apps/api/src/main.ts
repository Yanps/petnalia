import 'reflect-metadata';

import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { NestFactory } from '@nestjs/core';

import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({
    origin: process.env['APP_URL'] ?? 'http://localhost:3000',
    credentials: true,
  });

  app.setGlobalPrefix('v1');
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  const port = process.env['PORT'] ?? 4000;
  await app.listen(port);
}

void bootstrap();
