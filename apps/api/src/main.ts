import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';

// Which proxies may set X-Forwarded-For (Express "trust proxy" syntax). The web app's
// proxy and Server Actions forward the browser's IP; only trusted hops are believed, so a
// client cannot spoof its IP to dodge rate limiting. "loopback" fits web+API on one host.
function trustProxySetting(): boolean | number | string {
  const raw = process.env['TRUST_PROXY'] ?? 'loopback';
  if (raw === 'false') return false;
  if (raw === 'true') return true;
  return /^\d+$/.test(raw) ? Number(raw) : raw;
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });
  app.set('trust proxy', trustProxySetting());

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
