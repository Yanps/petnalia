import { HttpStatus, Injectable } from '@nestjs/common';
import type { CreateReviewInput } from '@petnalia/types';

import { DomainError } from '../../shared/errors/domain.error';
import { AppointmentNotFoundError } from '../appointments/appointments.errors';
import { ReviewsRepository } from './reviews.repository';

export class ReviewAlreadyExistsError extends DomainError {
  constructor() {
    super('REVIEW_ALREADY_EXISTS', 'Esta consulta já foi avaliada.', HttpStatus.CONFLICT);
  }
}

export class AppointmentNotReviewableError extends DomainError {
  constructor() {
    super(
      'APPOINTMENT_NOT_REVIEWABLE',
      'Só é possível avaliar consultas concluídas.',
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}

@Injectable()
export class ReviewsService {
  constructor(private readonly reviewsRepository: ReviewsRepository) {}

  async createReview(tutorId: string, dto: CreateReviewInput) {
    const appointment = await this.reviewsRepository.findAppointmentForReview(
      dto.appointmentId,
      tutorId,
    );

    if (!appointment) {
      throw new AppointmentNotFoundError();
    }

    if (appointment.status !== 'completed') {
      throw new AppointmentNotReviewableError();
    }

    const existing = await this.reviewsRepository.findByAppointment(dto.appointmentId);
    if (existing) throw new ReviewAlreadyExistsError();

    return this.reviewsRepository.create({
      authorId: tutorId,
      veterinarianId: appointment.veterinarianId,
      appointmentId: dto.appointmentId,
      rating: dto.rating,
      ...(dto.text !== undefined ? { text: dto.text } : {}),
    });
  }

  async listVetReviews(veterinarianId: string, query: { page: number; limit: number }) {
    const { data, total } = await this.reviewsRepository.findByVet(veterinarianId, query);
    return {
      data: data.map((r) => ({
        id: r.id,
        appointmentId: r.appointmentId,
        authorId: r.authorId,
        veterinarianId: r.veterinarianId,
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
