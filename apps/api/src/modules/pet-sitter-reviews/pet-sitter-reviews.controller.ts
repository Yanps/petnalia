import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { User } from '@prisma/client';
import { CreatePetSitterReviewInputSchema } from '@petnalia/types';
import { z } from 'zod';

import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Public } from '../../shared/decorators/public.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { PetSitterReviewsService } from './pet-sitter-reviews.service';

@Controller('pet-sitter-reviews')
export class PetSitterReviewsController {
  constructor(private readonly reviewsService: PetSitterReviewsService) {}

  @Public()
  @Get()
  listSitterReviews(@Query() query: unknown) {
    const parsed = z.object({
      petSitterId: z.string().uuid(),
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().max(50).default(10),
    }).parse(query);
    return this.reviewsService.listSitterReviews(parsed.petSitterId, {
      page: parsed.page,
      limit: parsed.limit,
    });
  }

  @Post()
  @Roles('tutor')
  @HttpCode(HttpStatus.CREATED)
  createReview(@CurrentUser() user: User, @Body() body: unknown) {
    const dto = CreatePetSitterReviewInputSchema.parse(body);
    return this.reviewsService.createReview(user.id, dto);
  }
}
