import type { Notification } from '@prisma/client';
import type { Queue } from 'bullmq';
import { describe, it, expect, vi } from 'vitest';


import { NotificationNotFoundError } from './notifications.errors';
import type { NotificationsRepository } from './notifications.repository';
import { NotificationsService } from './notifications.service';
import type { EmailJobPayload } from '../../shared/mailer/email-templates';

function makeQueue(overrides: Partial<Queue> = {}) {
  return {
    add: vi.fn().mockResolvedValue({ id: 'job-1' }),
    ...overrides,
  } as unknown as Queue<EmailJobPayload>;
}

const baseNotification: Notification = {
  id: 'notif-uuid-1',
  userId: 'user-uuid-1',
  type: 'appointment_booked',
  channel: 'push',
  payload: { appointmentId: 'apt-1' },
  readAt: null,
  sentAt: null,
  status: 'pending',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
};

function makeRepo(overrides: Partial<Record<keyof NotificationsRepository, unknown>> = {}) {
  return {
    create: vi.fn().mockResolvedValue(baseNotification),
    markAsRead: vi.fn().mockResolvedValue(true),
    findByUser: vi.fn().mockResolvedValue({ items: [baseNotification], total: 1 }),
    ...overrides,
  } as unknown as NotificationsRepository;
}

function makeService(queue = makeQueue(), repo = makeRepo()) {
  return new NotificationsService(queue, repo);
}

const basePayload: EmailJobPayload = {
  to: 'tutor@petnalia.com',
  type: 'vet_approved',
  name: 'Dr. Bruno',
};

describe('NotificationsService.enqueueEmail', () => {
  it('adiciona o job na fila com o tipo correto como nome', async () => {
    const queue = makeQueue();
    await makeService(queue).enqueueEmail(basePayload);
    expect(queue.add).toHaveBeenCalledWith(basePayload.type, basePayload, expect.any(Object));
  });

  it('configura 3 tentativas com backoff exponencial de 5s', async () => {
    const queue = makeQueue();
    await makeService(queue).enqueueEmail(basePayload);
    expect(queue.add).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      expect.objectContaining({
        attempts: 3,
        backoff: { type: 'exponential', delay: 5_000 },
      }),
    );
  });

  it('configura removeOnComplete e removeOnFail', async () => {
    const queue = makeQueue();
    await makeService(queue).enqueueEmail(basePayload);
    expect(queue.add).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      expect.objectContaining({
        removeOnComplete: true,
        removeOnFail: expect.objectContaining({ count: expect.any(Number) }),
      }),
    );
  });

  it('nunca lança exceção mesmo quando a fila falha', async () => {
    const queue = makeQueue({ add: vi.fn().mockRejectedValue(new Error('Redis down')) });
    await expect(makeService(queue).enqueueEmail(basePayload)).resolves.toBeUndefined();
  });

  it('funciona com qualquer tipo de payload', async () => {
    const payloads: EmailJobPayload[] = [
      { to: 'a@b.com', type: 'vet_approved', name: 'X' },
      { to: 'a@b.com', type: 'vet_rejected', name: 'X', reason: 'CRMV vencido' },
      { to: 'a@b.com', type: 'vet_registered', name: 'X' },
      { to: 'a@b.com', type: 'appointment_booked_tutor', name: 'X', otherPartyName: 'Dr. Y', petName: 'Rex', scheduledAt: '2026-02-01T09:00:00Z' },
    ];
    const queue = makeQueue();
    const service = makeService(queue);
    for (const payload of payloads) {
      await expect(service.enqueueEmail(payload)).resolves.toBeUndefined();
    }
    expect(queue.add).toHaveBeenCalledTimes(payloads.length);
  });
});

describe('NotificationsService.notify', () => {
  it('persiste a notificação com status padrão pending', async () => {
    const repo = makeRepo();
    await makeService(undefined, repo).notify({
      userId: 'user-uuid-1',
      type: 'appointment_booked',
      channel: 'push',
      payload: { appointmentId: 'apt-1' },
    });

    expect(repo.create).toHaveBeenCalledWith({
      userId: 'user-uuid-1',
      type: 'appointment_booked',
      channel: 'push',
      payload: { appointmentId: 'apt-1' },
      status: 'pending',
    });
  });

  it('respeita o status explícito quando informado', async () => {
    const repo = makeRepo();
    await makeService(undefined, repo).notify({
      userId: 'user-uuid-1',
      type: 'appointment_booked',
      channel: 'push',
      payload: {},
      status: 'sent',
    });

    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ status: 'sent' }));
  });
});

describe('NotificationsService.list', () => {
  it('mapeia os registros do repositório para o formato paginado', async () => {
    const repo = makeRepo();
    const result = await makeService(undefined, repo).list('user-uuid-1', { page: 1, limit: 20 });

    expect(repo.findByUser).toHaveBeenCalledWith('user-uuid-1', 1, 20);
    expect(result).toEqual({
      items: [{
        id: 'notif-uuid-1',
        userId: 'user-uuid-1',
        type: 'appointment_booked',
        channel: 'push',
        payload: { appointmentId: 'apt-1' },
        readAt: null,
        sentAt: null,
        status: 'pending',
        createdAt: '2026-01-01T00:00:00.000Z',
      }],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
  });
});

describe('NotificationsService.markAsRead', () => {
  it('delega para o repositório com o notificationId e userId corretos', async () => {
    const repo = makeRepo();
    await makeService(undefined, repo).markAsRead('notif-uuid-1', 'user-uuid-1');
    expect(repo.markAsRead).toHaveBeenCalledWith('notif-uuid-1', 'user-uuid-1');
  });

  it('lança NotificationNotFoundError quando não pertence ao usuário', async () => {
    const repo = makeRepo({ markAsRead: vi.fn().mockResolvedValue(false) });
    await expect(makeService(undefined, repo).markAsRead('notif-uuid-1', 'user-uuid-1'))
      .rejects.toThrow(NotificationNotFoundError);
  });
});
