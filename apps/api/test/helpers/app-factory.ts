import 'reflect-metadata';

import type { INestApplication, ModuleMetadata } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';

import { AuthModule } from '../../src/modules/auth/auth.module';
import { UsersModule } from '../../src/modules/users/users.module';
import { VeterinariansModule } from '../../src/modules/veterinarians/veterinarians.module';
import { AllExceptionsFilter } from '../../src/shared/filters/all-exceptions.filter';
import { JwtAuthGuard } from '../../src/shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../src/shared/guards/roles.guard';
import { MailerModule } from '../../src/shared/mailer/mailer.module';
import { PrismaModule } from '../../src/shared/prisma/prisma.module';
import { QueueModule } from '../../src/shared/queue/queue.module';
import { RedisModule } from '../../src/shared/redis/redis.module';
import { RedisService } from '../../src/shared/redis/redis.service';
import { StorageModule } from '../../src/shared/storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    QueueModule,
    MailerModule,
    StorageModule,
    AuthModule,
    UsersModule,
    VeterinariansModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
class TestAppModule {}

export interface TestAppOptions {
  /** Feature modules beyond the auth/users/vets baseline. */
  readonly imports?: NonNullable<ModuleMetadata['imports']>;
}

/**
 * In-memory stand-in for RedisService (only the commands the services use).
 * Keeps API tests to a single Postgres container.
 */
export class InMemoryRedis {
  private readonly store = new Map<string, string>();

  get(key: string): Promise<string | null> {
    return Promise.resolve(this.store.get(key) ?? null);
  }

  set(key: string, value: string): Promise<'OK'> {
    this.store.set(key, value);
    return Promise.resolve('OK');
  }

  del(key: string): Promise<number> {
    return Promise.resolve(this.store.delete(key) ? 1 : 0);
  }

  quit(): Promise<'OK'> {
    return Promise.resolve('OK');
  }
}

export async function createTestApp(
  databaseUrl: string,
  options: TestAppOptions = {},
): Promise<INestApplication> {
  process.env['DATABASE_URL'] = databaseUrl;
  process.env['DIRECT_URL'] = databaseUrl;
  process.env['JWT_ACCESS_SECRET'] = 'test-access-secret-at-least-32-chars!!';
  process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret-min-32-chars!!!!';
  process.env['JWT_ACCESS_TTL'] = '15m';
  process.env['JWT_REFRESH_TTL'] = '30d';
  process.env['APP_URL'] = 'http://localhost:3000';
  process.env['API_URL'] = 'http://localhost:4000';

  const moduleRef = await Test.createTestingModule({
    imports: [TestAppModule, RedisModule, ...(options.imports ?? [])],
  })
    .overrideProvider(RedisService)
    .useValue(new InMemoryRedis())
    .compile();

  const app = moduleRef.createNestApplication();
  app.use(cookieParser());
  app.setGlobalPrefix('v1');
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.init();
  return app;
}
