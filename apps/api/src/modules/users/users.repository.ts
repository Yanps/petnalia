import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });
  }

  create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data,
      include: { profile: true },
    });
  }

  createVet(input: {
    email: string;
    passwordHash: string;
    fullName: string;
    crmv: string;
    crmvState: string;
  }) {
    return this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
        role: 'veterinarian',
        profile: { create: { fullName: input.fullName } },
        veterinarian: {
          create: {
            crmv: input.crmv,
            crmvState: input.crmvState,
            verificationStatus: 'pending',
          },
        },
      },
      include: { profile: true },
    });
  }

  update(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({ where: { id }, data });
  }

  softDelete(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { status: 'deleted', deletedAt: new Date() },
    });
  }
}
