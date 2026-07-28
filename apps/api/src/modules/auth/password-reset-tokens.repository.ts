import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../shared/prisma/prisma.service';

interface CreateResetTokenData {
  readonly userId: string;
  readonly tokenHash: string;
  readonly expiresAt: Date;
}

@Injectable()
export class PasswordResetTokensRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateResetTokenData) {
    return this.prisma.passwordResetToken.create({ data });
  }

  findByHash(tokenHash: string) {
    return this.prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  }

  markUsed(id: string) {
    return this.prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }
}
