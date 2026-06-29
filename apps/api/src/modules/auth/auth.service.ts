import { createHash, randomBytes } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { hash as argonHash, verify as argonVerify } from 'argon2';
import type { LoginInput, RegisterInput, AuthTokens } from '@petnalia/types';

import { UsersRepository } from '../users/users.repository';
import {
  AccountSuspendedError,
  EmailTakenError,
  InvalidCredentialsError,
  TokenExpiredError,
  TokenRevokedError,
} from './auth.errors';
import { TokensRepository } from './tokens.repository';

function parseTtlMs(ttl: string): number {
  const m = ttl.match(/^(\d+)([smhd])$/);
  if (!m) return 900_000;
  const mult: Record<string, number> = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return Number(m[1]) * (mult[m[2]!] ?? 1_000);
}

function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

function generateRawToken(): string {
  return randomBytes(40).toString('hex');
}

export interface IssuedTokens {
  readonly tokens: AuthTokens;
  readonly rawRefreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly refreshTtlMs: number;

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly usersRepo: UsersRepository,
    private readonly tokensRepo: TokensRepository,
  ) {
    this.refreshTtlMs = parseTtlMs(config.get('JWT_REFRESH_TTL', '30d'));
  }

  async register(dto: RegisterInput): Promise<IssuedTokens> {
    const existing = await this.usersRepo.findByEmail(dto.email);
    if (existing) throw new EmailTakenError();

    const passwordHash = await argonHash(dto.password);

    const user = await this.usersRepo.create({
      email: dto.email,
      passwordHash,
      role: dto.role,
      profile: { create: { fullName: dto.fullName } },
    });

    return this.issueTokens(user.id, user.email, user.role);
  }

  async login(dto: LoginInput): Promise<IssuedTokens> {
    const user = await this.usersRepo.findByEmail(dto.email);
    if (!user) throw new InvalidCredentialsError();

    const valid = await argonVerify(user.passwordHash, dto.password);
    if (!valid) throw new InvalidCredentialsError();

    if (user.status === 'suspended') throw new AccountSuspendedError();
    if (user.status === 'deleted') throw new InvalidCredentialsError();

    return this.issueTokens(user.id, user.email, user.role);
  }

  async refresh(rawToken: string): Promise<IssuedTokens> {
    const stored = await this.tokensRepo.findByHash(hashToken(rawToken));

    if (!stored) throw new TokenRevokedError();
    if (stored.revokedAt) throw new TokenRevokedError();
    if (stored.expiresAt < new Date()) throw new TokenExpiredError();

    await this.tokensRepo.revoke(stored.id);

    const user = await this.usersRepo.findById(stored.userId);
    if (!user || user.status !== 'active') throw new InvalidCredentialsError();

    return this.issueTokens(user.id, user.email, user.role);
  }

  async logout(rawToken: string): Promise<void> {
    const stored = await this.tokensRepo.findByHash(hashToken(rawToken));
    if (stored && !stored.revokedAt) {
      await this.tokensRepo.revoke(stored.id);
    }
  }

  private async issueTokens(userId: string, email: string, role: string): Promise<IssuedTokens> {
    const ttl = this.config.get<string>('JWT_ACCESS_TTL', '15m');

    const accessToken = this.jwtService.sign(
      { sub: userId, email, role },
      { expiresIn: ttl },
    );

    const rawRefreshToken = generateRawToken();
    await this.tokensRepo.create({
      userId,
      tokenHash: hashToken(rawRefreshToken),
      expiresAt: new Date(Date.now() + this.refreshTtlMs),
    });

    return {
      tokens: { accessToken, expiresIn: parseTtlMs(ttl) / 1_000 },
      rawRefreshToken,
    };
  }
}
