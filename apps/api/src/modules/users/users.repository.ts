import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  // TODO: findById(id)
  // TODO: findByEmail(email)
  // TODO: create(data)
  // TODO: update(id, data)
  // TODO: softDelete(id)
}
