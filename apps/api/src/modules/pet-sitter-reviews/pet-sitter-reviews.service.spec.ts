import { describe, it, expect, vi } from 'vitest';
import type { PetSitterReview } from '@prisma/client';
import type { CreatePetSitterReviewInput } from '@petnalia/types';

import { PetSitterBookingNotFoundError } from '../pet-sitter-bookings/pet-sitter-bookings.errors';
import { PetSitterReviewsRepository } from './pet-sitter-reviews.repository';
import {
  PetSitterBookingNotReviewableError,
  PetSitterReviewAlreadyExistsError,
  PetSitterReviewsService,
} from './pet-sitter-reviews.service';

const TUTOR_ID = 'tutor-uuid-1';
const SITTER_ID = 'sitter-uuid-1';
const BOOKING_ID = 'booking-uuid-1';
const REVIEW_ID = 'review-uuid-1';

const completedBooking = {
  id: BOOKING_ID,
  status: 'completed' as const,
  petSitterId: SITTER_ID,
};

const baseReview: PetSitterReview = {
  id: REVIEW_ID,
  authorId: TUTOR_ID,
  petSitterId: SITTER_ID,
  bookingId: BOOKING_ID,
  rating: 5,
  text: 'Cuidou super bem do meu pet!',
  publishedAt: new Date('2026-02-01'),
  createdAt: new Date('2026-02-01'),
  updatedAt: new Date('2026-02-01'),
};

function makeRepo(overrides: Partial<PetSitterReviewsRepository> = {}) {
  return {
    findBookingForReview: vi.fn().mockResolvedValue(completedBooking),
    findByBooking: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue(baseReview),
    findBySitter: vi.fn().mockResolvedValue({ data: [baseReview], total: 1 }),
    ...overrides,
  } as unknown as PetSitterReviewsRepository;
}

const baseInput: CreatePetSitterReviewInput = {
  bookingId: BOOKING_ID,
  rating: 5,
  text: 'Cuidou super bem do meu pet!',
};

describe('PetSitterReviewsService.createReview', () => {
  it('lança PetSitterBookingNotFoundError quando a reserva não pertence ao tutor', async () => {
    const service = new PetSitterReviewsService(
      makeRepo({ findBookingForReview: vi.fn().mockResolvedValue(null) }),
    );
    await expect(service.createReview(TUTOR_ID, baseInput)).rejects.toThrow(PetSitterBookingNotFoundError);
  });

  it('lança PetSitterBookingNotReviewableError quando a reserva não está concluída', async () => {
    const service = new PetSitterReviewsService(
      makeRepo({
        findBookingForReview: vi.fn().mockResolvedValue({ ...completedBooking, status: 'requested' }),
      }),
    );
    await expect(service.createReview(TUTOR_ID, baseInput)).rejects.toThrow(PetSitterBookingNotReviewableError);
  });

  it('lança PetSitterBookingNotReviewableError para reserva cancelada', async () => {
    const service = new PetSitterReviewsService(
      makeRepo({
        findBookingForReview: vi.fn().mockResolvedValue({ ...completedBooking, status: 'cancelled' }),
      }),
    );
    await expect(service.createReview(TUTOR_ID, baseInput)).rejects.toThrow(PetSitterBookingNotReviewableError);
  });

  it('lança PetSitterReviewAlreadyExistsError quando a reserva já foi avaliada', async () => {
    const service = new PetSitterReviewsService(
      makeRepo({ findByBooking: vi.fn().mockResolvedValue(baseReview) }),
    );
    await expect(service.createReview(TUTOR_ID, baseInput)).rejects.toThrow(PetSitterReviewAlreadyExistsError);
  });

  it('cria review com os campos corretos no caminho feliz', async () => {
    const repo = makeRepo();
    const service = new PetSitterReviewsService(repo);
    await service.createReview(TUTOR_ID, baseInput);
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({
      authorId: TUTOR_ID,
      petSitterId: SITTER_ID,
      bookingId: BOOKING_ID,
      rating: 5,
      text: 'Cuidou super bem do meu pet!',
    }));
  });

  it('cria review sem texto quando não fornecido', async () => {
    const repo = makeRepo();
    await new PetSitterReviewsService(repo).createReview(TUTOR_ID, { bookingId: BOOKING_ID, rating: 4 });
    const call = vi.mocked(repo.create).mock.calls[0]![0];
    expect(call.text).toBeUndefined();
  });

  it('verifica se a reserva já tem review antes de criar', async () => {
    const repo = makeRepo();
    await new PetSitterReviewsService(repo).createReview(TUTOR_ID, baseInput);
    expect(repo.findByBooking).toHaveBeenCalledWith(BOOKING_ID);
  });
});

describe('PetSitterReviewsService.listSitterReviews', () => {
  it('formata a resposta com datas em ISO string', async () => {
    const repo = makeRepo();
    const result = await new PetSitterReviewsService(repo).listSitterReviews(SITTER_ID, { page: 1, limit: 10 });
    expect(result.data[0]!.publishedAt).toBe('2026-02-01T00:00:00.000Z');
    expect(result.data[0]!.createdAt).toBe('2026-02-01T00:00:00.000Z');
  });

  it('retorna publishedAt null quando não publicado', async () => {
    const repo = makeRepo({
      findBySitter: vi.fn().mockResolvedValue({
        data: [{ ...baseReview, publishedAt: null }],
        total: 1,
      }),
    });
    const result = await new PetSitterReviewsService(repo).listSitterReviews(SITTER_ID, { page: 1, limit: 10 });
    expect(result.data[0]!.publishedAt).toBeNull();
  });

  it('repassa page e limit para o repositório', async () => {
    const repo = makeRepo({ findBySitter: vi.fn().mockResolvedValue({ data: [], total: 0 }) });
    await new PetSitterReviewsService(repo).listSitterReviews(SITTER_ID, { page: 3, limit: 5 });
    expect(repo.findBySitter).toHaveBeenCalledWith(SITTER_ID, { page: 3, limit: 5 });
  });

  it('inclui total e paginação na resposta', async () => {
    const repo = makeRepo({ findBySitter: vi.fn().mockResolvedValue({ data: [], total: 42 }) });
    const result = await new PetSitterReviewsService(repo).listSitterReviews(SITTER_ID, { page: 2, limit: 10 });
    expect(result.total).toBe(42);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(10);
  });
});
