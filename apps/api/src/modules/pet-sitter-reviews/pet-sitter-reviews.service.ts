import { HttpStatus, Injectable } from '@nestjs/common';
import type { CreatePetSitterReviewInput } from '@petnalia/types';

import { DomainError } from '../../shared/errors/domain.error';
import { PetSitterBookingNotFoundError } from '../pet-sitter-bookings/pet-sitter-bookings.errors';
import { PetSitterReviewsRepository } from './pet-sitter-reviews.repository';

export class PetSitterReviewAlreadyExistsError extends DomainError {
  constructor() {
    super('PET_SITTER_REVIEW_ALREADY_EXISTS', 'Esta reserva já foi avaliada.', HttpStatus.CONFLICT);
  }
}

export class PetSitterBookingNotReviewableError extends DomainError {
  constructor() {
    super(
      'PET_SITTER_BOOKING_NOT_REVIEWABLE',
      'Só é possível avaliar reservas concluídas.',
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}

@Injectable()
export class PetSitterReviewsService {
  constructor(private readonly reviewsRepository: PetSitterReviewsRepository) {}

  async createReview(tutorId: string, dto: CreatePetSitterReviewInput) {
    const booking = await this.reviewsRepository.findBookingForReview(dto.bookingId, tutorId);

    if (!booking) {
      throw new PetSitterBookingNotFoundError();
    }

    if (booking.status !== 'completed') {
      throw new PetSitterBookingNotReviewableError();
    }

    const existing = await this.reviewsRepository.findByBooking(dto.bookingId);
    if (existing) throw new PetSitterReviewAlreadyExistsError();

    return this.reviewsRepository.create({
      authorId: tutorId,
      petSitterId: booking.petSitterId,
      bookingId: dto.bookingId,
      rating: dto.rating,
      ...(dto.text !== undefined ? { text: dto.text } : {}),
    });
  }

  async listSitterReviews(petSitterId: string, query: { page: number; limit: number }) {
    const { data, total } = await this.reviewsRepository.findBySitter(petSitterId, query);
    return {
      data: data.map((r) => ({
        id: r.id,
        bookingId: r.bookingId,
        authorId: r.authorId,
        petSitterId: r.petSitterId,
        rating: r.rating,
        text: r.text,
        publishedAt: r.publishedAt?.toISOString() ?? null,
        createdAt: r.createdAt.toISOString(),
      })),
      total,
      page: query.page,
      limit: query.limit,
    };
  }
}
