import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../shared/prisma/prisma.service';

interface CreateTokenData {
  readonly userId: string;
  readonly tokenHash: string;
  readonly expiresAt: Date;
  readonly deviceId?: string | null;
}

@Injectable()
export class TokensRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateTokenData) {
    return this.prisma.refreshToken.create({ data });
  }

  findByHash(tokenHash: string) {
    return this.prisma.refreshToken.findUnique({ where: { tokenHash } });
  }

  revoke(id: string) {
    return this.prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  revokeAllForUser(userId: string) {
    return this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
