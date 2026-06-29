import 'reflect-metadata';

import type { INestApplication } from '@nestjs/common';
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
import { PrismaModule } from '../../src/shared/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
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

export async function createTestApp(databaseUrl: string): Promise<INestApplication> {
  process.env['DATABASE_URL'] = databaseUrl;
  process.env['DIRECT_URL'] = databaseUrl;
  process.env['JWT_ACCESS_SECRET'] = 'test-access-secret-at-least-32-chars!!';
  process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret-min-32-chars!!!!';
  process.env['JWT_ACCESS_TTL'] = '15m';
  process.env['JWT_REFRESH_TTL'] = '30d';
  process.env['APP_URL'] = 'http://localhost:3000';
  process.env['API_URL'] = 'http://localhost:4000';

  const moduleRef = await Test.createTestingModule({
    imports: [TestAppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  app.use(cookieParser());
  app.setGlobalPrefix('v1');
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.init();
  return app;
}
