import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class SubscriptionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  // TODO: findByVet(vetId)
  // TODO: create(vetId, data)
  // TODO: updateStatus(vetId, status, data)
}
