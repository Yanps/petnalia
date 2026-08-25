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

  createPetSitter(input: { email: string; passwordHash: string; fullName: string }) {
    return this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
        role: 'pet_sitter',
        profile: { create: { fullName: input.fullName } },
        petSitter: { create: { fullName: input.fullName } },
      },
      include: { profile: true },
    });
  }

  update(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({ where: { id }, data });
  }

  updateProfile(userId: string, data: Prisma.ProfileUpdateInput) {
    return this.prisma.profile.update({ where: { userId }, data });
  }

  softDelete(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { status: 'deleted', deletedAt: new Date() },
    });
  }

  findAllByRole(role: 'admin' | 'tutor' | 'veterinarian' | 'pet_sitter') {
    return this.prisma.user.findMany({
      where: { role, status: 'active', deletedAt: null },
      include: { profile: true },
    });
  }

  async findAllPaginated(page: number, limit: number) {
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        include: { profile: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count(),
    ]);
    return { rows, total };
  }
}
