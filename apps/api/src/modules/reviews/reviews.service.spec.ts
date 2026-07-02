import { describe, it, expect, vi } from 'vitest';
import type { Review } from '@prisma/client';
import type { CreateReviewInput } from '@petnalia/types';

import { AppointmentNotFoundError } from '../appointments/appointments.errors';
import { ReviewsRepository } from './reviews.repository';
import {
  AppointmentNotReviewableError,
  ReviewAlreadyExistsError,
  ReviewsService,
} from './reviews.service';

const TUTOR_ID = 'tutor-uuid-1';
const VET_ID = 'vet-uuid-1';
const APPT_ID = 'appt-uuid-1';
const REVIEW_ID = 'review-uuid-1';

const completedAppointment = {
  id: APPT_ID,
  status: 'completed' as const,
  veterinarianId: VET_ID,
};

const baseReview: Review = {
  id: REVIEW_ID,
  authorId: TUTOR_ID,
  veterinarianId: VET_ID,
  appointmentId: APPT_ID,
  rating: 5,
  text: 'Excelente atendimento!',
  publishedAt: new Date('2026-02-01'),
  createdAt: new Date('2026-02-01'),
  updatedAt: new Date('2026-02-01'),
};

function makeRepo(overrides: Partial<ReviewsRepository> = {}) {
  return {
    findAppointmentForReview: vi.fn().mockResolvedValue(completedAppointment),
    findByAppointment: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue(baseReview),
    findByVet: vi.fn().mockResolvedValue({ data: [baseReview], total: 1 }),
    ...overrides,
  } as unknown as ReviewsRepository;
}

const baseInput: CreateReviewInput = {
  appointmentId: APPT_ID,
  rating: 5,
  text: 'Excelente atendimento!',
};

describe('ReviewsService.createReview', () => {
  it('lança AppointmentNotFoundError quando consulta não pertence ao tutor', async () => {
    const service = new ReviewsService(
      makeRepo({ findAppointmentForReview: vi.fn().mockResolvedValue(null) }),
    );
    await expect(service.createReview(TUTOR_ID, baseInput)).rejects.toThrow(AppointmentNotFoundError);
  });

  it('lança AppointmentNotReviewableError quando consulta não está concluída', async () => {
    const service = new ReviewsService(
      makeRepo({
        findAppointmentForReview: vi.fn().mockResolvedValue({ ...completedAppointment, status: 'requested' }),
      }),
    );
    await expect(service.createReview(TUTOR_ID, baseInput)).rejects.toThrow(AppointmentNotReviewableError);
  });

  it('lança AppointmentNotReviewableError para consulta cancelada', async () => {
    const service = new ReviewsService(
      makeRepo({
        findAppointmentForReview: vi.fn().mockResolvedValue({ ...completedAppointment, status: 'cancelled' }),
      }),
    );
    await expect(service.createReview(TUTOR_ID, baseInput)).rejects.toThrow(AppointmentNotReviewableError);
  });

  it('lança ReviewAlreadyExistsError quando consulta já foi avaliada', async () => {
    const service = new ReviewsService(
      makeRepo({ findByAppointment: vi.fn().mockResolvedValue(baseReview) }),
    );
    await expect(service.createReview(TUTOR_ID, baseInput)).rejects.toThrow(ReviewAlreadyExistsError);
  });

  it('cria review com os campos corretos no caminho feliz', async () => {
    const repo = makeRepo();
    const service = new ReviewsService(repo);
    await service.createReview(TUTOR_ID, baseInput);
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({
      authorId: TUTOR_ID,
      veterinarianId: VET_ID,
      appointmentId: APPT_ID,
      rating: 5,
      text: 'Excelente atendimento!',
    }));
  });

  it('cria review sem texto quando não fornecido', async () => {
    const repo = makeRepo();
    await new ReviewsService(repo).createReview(TUTOR_ID, { appointmentId: APPT_ID, rating: 4 });
    const call = vi.mocked(repo.create).mock.calls[0]![0];
    expect(call.text).toBeUndefined();
  });

  it('verifica se a consulta já tem review antes de criar', async () => {
    const repo = makeRepo();
    await new ReviewsService(repo).createReview(TUTOR_ID, baseInput);
    expect(repo.findByAppointment).toHaveBeenCalledWith(APPT_ID);
  });
});

describe('ReviewsService.listVetReviews', () => {
  it('formata a resposta com datas em ISO string', async () => {
    const repo = makeRepo();
    const result = await new ReviewsService(repo).listVetReviews(VET_ID, { page: 1, limit: 10 });
    expect(result.data[0]!.publishedAt).toBe('2026-02-01T00:00:00.000Z');
    expect(result.data[0]!.createdAt).toBe('2026-02-01T00:00:00.000Z');
  });

  it('retorna publishedAt null quando não publicado', async () => {
    const repo = makeRepo({
      findByVet: vi.fn().mockResolvedValue({
        data: [{ ...baseReview, publishedAt: null }],
        total: 1,
      }),
    });
    const result = await new ReviewsService(repo).listVetReviews(VET_ID, { page: 1, limit: 10 });
    expect(result.data[0]!.publishedAt).toBeNull();
  });

  it('repassa page e limit para o repositório', async () => {
    const repo = makeRepo({ findByVet: vi.fn().mockResolvedValue({ data: [], total: 0 }) });
    await new ReviewsService(repo).listVetReviews(VET_ID, { page: 3, limit: 5 });
    expect(repo.findByVet).toHaveBeenCalledWith(VET_ID, { page: 3, limit: 5 });
  });

  it('inclui total e paginação na resposta', async () => {
    const repo = makeRepo({ findByVet: vi.fn().mockResolvedValue({ data: [], total: 42 }) });
    const result = await new ReviewsService(repo).listVetReviews(VET_ID, { page: 2, limit: 10 });
    expect(result.total).toBe(42);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(10);
  });
});
