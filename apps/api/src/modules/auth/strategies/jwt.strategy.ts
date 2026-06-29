import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { User } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UsersRepository } from '../../users/users.repository';

export interface JwtPayload {
  readonly sub: string;
  readonly email: string;
  readonly role: string;
  readonly iat?: number;
  readonly exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly usersRepo: UsersRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.usersRepo.findById(payload.sub);
    if (!user || user.status !== 'active') throw new UnauthorizedException();
    return user;
  }
}
