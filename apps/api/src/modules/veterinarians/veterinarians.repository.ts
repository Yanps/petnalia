import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class VeterinariansRepository {
  constructor(private readonly prisma: PrismaService) {}

  // TODO: findById(id)
  // TODO: findByUserId(userId)
  // TODO: create(userId, data)
  // TODO: update(id, data)
  // TODO: updateVerificationStatus(id, status)
}
