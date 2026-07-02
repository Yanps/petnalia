import { describe, it, expect, vi } from 'vitest';
import type { Queue } from 'bullmq';

import type { EmailJobPayload } from '../../shared/mailer/email-templates';
import { NotificationsService } from './notifications.service';

function makeQueue(overrides: Partial<Queue> = {}) {
  return {
    add: vi.fn().mockResolvedValue({ id: 'job-1' }),
    ...overrides,
  } as unknown as Queue<EmailJobPayload>;
}

function makeService(queue = makeQueue()) {
  return new NotificationsService(queue);
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
