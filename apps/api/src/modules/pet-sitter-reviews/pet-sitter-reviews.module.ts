import { Module } from '@nestjs/common';

import { PetSitterReviewsController } from './pet-sitter-reviews.controller';
import { PetSitterReviewsRepository } from './pet-sitter-reviews.repository';
import { PetSitterReviewsService } from './pet-sitter-reviews.service';

@Module({
  controllers: [PetSitterReviewsController],
  providers: [PetSitterReviewsService, PetSitterReviewsRepository],
  exports: [PetSitterReviewsService],
})
export class PetSitterReviewsModule {}
