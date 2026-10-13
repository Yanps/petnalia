import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';


import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordResetTokensRepository } from './password-reset-tokens.repository';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TokensRepository } from './tokens.repository';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: config.get('JWT_ACCESS_TTL', '15m') },
      }),
    }),
    UsersModule,
    PrismaModule,
    NotificationsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, TokensRepository, PasswordResetTokensRepository, JwtStrategy],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
