import { Injectable } from '@nestjs/common';
import type { UpdateProfileInput, UserMeResponse } from '@petnalia/types';
import { stripCPF } from '@petnalia/validation';
import type { Prisma } from '@prisma/client';

import { UserNotFoundError } from './users.errors';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getMe(userId: string): Promise<UserMeResponse> {
    const user = await this.usersRepository.findById(userId);
    if (!user?.profile) throw new UserNotFoundError();

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      fullName: user.profile.fullName,
      phone: user.profile.phone,
      avatarUrl: user.profile.avatarUrl,
      cpf: user.profile.cpf,
      locale: user.profile.locale,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async updateMe(userId: string, dto: UpdateProfileInput): Promise<void> {
    const data: Prisma.ProfileUpdateInput = {};
    if (dto.fullName !== undefined) data.fullName = dto.fullName;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.avatarUrl !== undefined) data.avatarUrl = dto.avatarUrl;
    if (dto.cpf !== undefined) data.cpf = stripCPF(dto.cpf);

    await this.usersRepository.updateProfile(userId, data);
  }

  async deleteMe(userId: string): Promise<void> {
    await this.usersRepository.softDelete(userId);
  }
}
