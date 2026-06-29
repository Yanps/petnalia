import { Injectable } from '@nestjs/common';
import type { CreateAddressInput } from '@petnalia/types';

import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class AddressesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUser(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(userId: string, data: CreateAddressInput) {
    return this.prisma.address.create({
      data: {
        userId,
        label: data.label ?? null,
        street: data.street,
        number: data.number,
        complement: data.complement ?? null,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        cep: data.cep,
      },
    });
  }

  async delete(id: string, userId: string): Promise<number> {
    const result = await this.prisma.address.deleteMany({ where: { id, userId } });
    return result.count;
  }
}
