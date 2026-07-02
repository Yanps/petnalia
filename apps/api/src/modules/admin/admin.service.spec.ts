import { describe, it, expect, vi, beforeEach } from 'vitest';

import type { StoragePort } from '../../shared/storage/storage.port';
import { NotificationsService } from '../notifications/notifications.service';
import { VeterinariansRepository } from '../veterinarians/veterinarians.repository';
import { AdminService, VetNotFoundError, VetNotPendingError } from './admin.service';

const VET_ID = 'vet-uuid-1';
const USER_ID = 'user-uuid-1';

const baseVet = {
  id: VET_ID,
  userId: USER_ID,
  verificationStatus: 'pending',
  user: {
    email: 'vet@petnalia.com',
    profile: { fullName: 'Dr. Bruno' },
  },
};

function makeVetsRepo(overrides: Partial<VeterinariansRepository> = {}) {
  return {
    findPendingVets: vi.fn().mockResolvedValue({ rows: [], total: 0 }),
    findVetWithUser: vi.fn().mockResolvedValue(baseVet),
    updateVerificationStatus: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as VeterinariansRepository;
}

function makeNotifications() {
  return { enqueueEmail: vi.fn().mockResolvedValue(undefined) } as unknown as NotificationsService;
}

function makeStorage(overrides: Partial<StoragePort> = {}): StoragePort {
  return {
    putObject: vi.fn(),
    getPresignedUrl: vi.fn().mockResolvedValue('https://minio/crmv.jpg'),
    deleteObject: vi.fn(),
    ...overrides,
  };
}

function makeService(
  vetsRepo = makeVetsRepo(),
  notifications = makeNotifications(),
  storage = makeStorage(),
) {
  return new AdminService(vetsRepo, notifications, storage);
}

describe('AdminService.listPendingVets', () => {
  it('retorna lista vazia quando não há pendentes', async () => {
    const result = await makeService().listPendingVets(1, 10);
    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.hasMore).toBe(false);
  });

  it('gera presigned URL para vets com foto', async () => {
    const row = {
      vet_id: VET_ID,
      user_id: USER_ID,
      full_name: 'Dr. Bruno',
      email: 'vet@petnalia.com',
      crmv: '12345',
      crmv_state: 'SP',
      crmv_photo_key: 'crmv/user-uuid-1/1234.jpg',
      created_at: new Date('2026-01-01'),
    };
    const storage = makeStorage();
    const vetsRepo = makeVetsRepo({
      findPendingVets: vi.fn().mockResolvedValue({ rows: [row], total: 1 }),
    });
    const result = await makeService(vetsRepo, makeNotifications(), storage).listPendingVets(1, 10);
    expect(result.data[0]!.crmvPhotoUrl).toBe('https://minio/crmv.jpg');
    expect(storage.getPresignedUrl).toHaveBeenCalledWith(row.crmv_photo_key, 3600);
  });

  it('retorna crmvPhotoUrl null para vets sem foto', async () => {
    const row = {
      vet_id: VET_ID,
      user_id: USER_ID,
      full_name: 'Dr. Bruno',
      email: 'vet@petnalia.com',
      crmv: '12345',
      crmv_state: 'SP',
      crmv_photo_key: null,
      created_at: new Date('2026-01-01'),
    };
    const vetsRepo = makeVetsRepo({
      findPendingVets: vi.fn().mockResolvedValue({ rows: [row], total: 1 }),
    });
    const result = await makeService(vetsRepo).listPendingVets(1, 10);
    expect(result.data[0]!.crmvPhotoUrl).toBeNull();
  });

  it('calcula hasMore corretamente', async () => {
    const row = {
      vet_id: VET_ID, user_id: USER_ID, full_name: 'Dr. Bruno',
      email: 'vet@petnalia.com', crmv: '12345', crmv_state: 'SP',
      crmv_photo_key: null, created_at: new Date(),
    };
    const vetsRepo = makeVetsRepo({
      findPendingVets: vi.fn().mockResolvedValue({ rows: [row], total: 25 }),
    });
    const result = await makeService(vetsRepo).listPendingVets(1, 10);
    expect(result.hasMore).toBe(true); // 1 * 10 < 25
  });
});

describe('AdminService.approveVet', () => {
  it('lança VetNotFoundError quando vet não existe', async () => {
    const service = makeService(makeVetsRepo({ findVetWithUser: vi.fn().mockResolvedValue(null) }));
    await expect(service.approveVet(VET_ID)).rejects.toThrow(VetNotFoundError);
  });

  it('lança VetNotPendingError quando status é verified', async () => {
    const service = makeService(
      makeVetsRepo({ findVetWithUser: vi.fn().mockResolvedValue({ ...baseVet, verificationStatus: 'verified' }) }),
    );
    await expect(service.approveVet(VET_ID)).rejects.toThrow(VetNotPendingError);
  });

  it('lança VetNotPendingError quando status é rejected', async () => {
    const service = makeService(
      makeVetsRepo({ findVetWithUser: vi.fn().mockResolvedValue({ ...baseVet, verificationStatus: 'rejected' }) }),
    );
    await expect(service.approveVet(VET_ID)).rejects.toThrow(VetNotPendingError);
  });

  it('atualiza status para verified', async () => {
    const vetsRepo = makeVetsRepo();
    await makeService(vetsRepo).approveVet(VET_ID);
    expect(vetsRepo.updateVerificationStatus).toHaveBeenCalledWith(VET_ID, 'verified');
  });

  it('enfileira e-mail de aprovação', async () => {
    const notifications = makeNotifications();
    await makeService(makeVetsRepo(), notifications).approveVet(VET_ID);
    expect(notifications.enqueueEmail).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'vet_approved', to: baseVet.user.email }),
    );
  });

  it('aceita vet com status in_review', async () => {
    const service = makeService(
      makeVetsRepo({ findVetWithUser: vi.fn().mockResolvedValue({ ...baseVet, verificationStatus: 'in_review' }) }),
    );
    await expect(service.approveVet(VET_ID)).resolves.toBeUndefined();
  });
});

describe('AdminService.rejectVet', () => {
  it('lança VetNotFoundError quando vet não existe', async () => {
    const service = makeService(makeVetsRepo({ findVetWithUser: vi.fn().mockResolvedValue(null) }));
    await expect(service.rejectVet(VET_ID, 'motivo')).rejects.toThrow(VetNotFoundError);
  });

  it('lança VetNotPendingError quando já verificado', async () => {
    const service = makeService(
      makeVetsRepo({ findVetWithUser: vi.fn().mockResolvedValue({ ...baseVet, verificationStatus: 'verified' }) }),
    );
    await expect(service.rejectVet(VET_ID, 'motivo')).rejects.toThrow(VetNotPendingError);
  });

  it('atualiza status para rejected com motivo', async () => {
    const vetsRepo = makeVetsRepo();
    await makeService(vetsRepo).rejectVet(VET_ID, 'CRMV vencido');
    expect(vetsRepo.updateVerificationStatus).toHaveBeenCalledWith(VET_ID, 'rejected', 'CRMV vencido');
  });

  it('enfileira e-mail de rejeição com motivo', async () => {
    const notifications = makeNotifications();
    await makeService(makeVetsRepo(), notifications).rejectVet(VET_ID, 'CRMV vencido');
    expect(notifications.enqueueEmail).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'vet_rejected', reason: 'CRMV vencido' }),
    );
  });
});
