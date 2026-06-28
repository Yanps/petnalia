import { Controller } from '@nestjs/common';

import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // TODO: POST /reviews
  // TODO: GET /reviews?vetId=
}
