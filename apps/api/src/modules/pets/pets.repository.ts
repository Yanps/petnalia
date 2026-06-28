import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class PetsRepository {
  constructor(private readonly prisma: PrismaService) {}

  // TODO: findByOwner(ownerId)
  // TODO: findById(id)
  // TODO: create(ownerId, data)
  // TODO: update(id, data)
  // TODO: softDelete(id)
}
