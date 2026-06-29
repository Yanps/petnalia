import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { RolesGuard } from './shared/guards/roles.guard';
import { MailerModule } from './shared/mailer/mailer.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { QueueModule } from './shared/queue/queue.module';
import { RedisModule } from './shared/redis/redis.module';
import { StorageModule } from './shared/storage/storage.module';
import { AdminModule } from './modules/admin/admin.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { AuthModule } from './modules/auth/auth.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { GeoModule } from './modules/geo/geo.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PetsModule } from './modules/pets/pets.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { UsersModule } from './modules/users/users.module';
import { VeterinariansModule } from './modules/veterinarians/veterinarians.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    GeoModule,
    AvailabilityModule,
    AppointmentsModule,
    ReviewsModule,
    SubscriptionsModule,
    NotificationsModule,
    AddressesModule,
    AdminModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
