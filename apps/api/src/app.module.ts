import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { SentryModule } from '@sentry/nestjs/setup';

import { parseApiEnv } from '@petnalia/config';

import { AddressesModule } from './modules/addresses/addresses.module';
import { AdminModule } from './modules/admin/admin.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { AuthModule } from './modules/auth/auth.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PetSitterAvailabilityModule } from './modules/pet-sitter-availability/pet-sitter-availability.module';
import { PetSitterBookingsModule } from './modules/pet-sitter-bookings/pet-sitter-bookings.module';
import { PetSitterReviewsModule } from './modules/pet-sitter-reviews/pet-sitter-reviews.module';
import { PetSittersModule } from './modules/pet-sitters/pet-sitters.module';
import { PetsModule } from './modules/pets/pets.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { UsersModule } from './modules/users/users.module';
import { VeterinariansModule } from './modules/veterinarians/veterinarians.module';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { RolesGuard } from './shared/guards/roles.guard';
import { HealthController } from './shared/health/health.controller';
import { MailerModule } from './shared/mailer/mailer.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { QueueModule } from './shared/queue/queue.module';
import { RATE_LIMIT_DEFAULT, RateLimitGuard } from './shared/rate-limit/rate-limit';
import { RedisModule } from './shared/redis/redis.module';
import { StorageModule } from './shared/storage/storage.module';

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      // Fail fast on a missing/malformed variable (ADR-0001). Returns the raw values so
      // ConfigService keeps serving strings exactly as before.
      validate: (raw) => {
        parseApiEnv(raw);
        return raw;
      },
    }),
    ThrottlerModule.forRoot(RATE_LIMIT_DEFAULT),
    // Shared infrastructure (global)
    PrismaModule,
    RedisModule,
    QueueModule,
    StorageModule,
    MailerModule,
    // Domain modules — ordered by dependency
    AuthModule,
    UsersModule,
    PetsModule,
    VeterinariansModule,
    PetSittersModule,
    AvailabilityModule,
    AppointmentsModule,
    PetSitterAvailabilityModule,
    PetSitterBookingsModule,
    PetSitterReviewsModule,
    ReviewsModule,
    SubscriptionsModule,
    NotificationsModule,
    AddressesModule,
    AdminModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    // After JwtAuthGuard, so authenticated requests are limited per user.
    { provide: APP_GUARD, useClass: RateLimitGuard },
  ],
})
export class AppModule {}
