import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class AppointmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  // TODO: findById(id)
  // TODO: findByTutor(tutorId, query)
  // TODO: findByVet(vetId, query)
  // TODO: create(data) — inside $transaction with slot booking
  // TODO: updateStatus(id, status)
  // TODO: cancel(id, reason)
}
