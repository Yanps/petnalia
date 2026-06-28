import { Injectable } from '@nestjs/common';

import { ReviewsRepository } from './reviews.repository';

@Injectable()
export class ReviewsService {
  constructor(private readonly reviewsRepository: ReviewsRepository) {}

  // TODO: createReview(tutorId, appointmentId, dto) — verify appointment.status=completed
  // TODO: listVetReviews(vetId, pagination)
}
