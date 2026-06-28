import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class ReviewsRepository {
  constructor(private readonly prisma: PrismaService) {}

  // TODO: findByVet(vetId, pagination)
  // TODO: findByAppointment(appointmentId)
  // TODO: create(data)
  // TODO: getAverageRating(vetId)
}
