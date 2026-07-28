import { describe, it, expect, vi, beforeEach } from 'vitest';

import type { StoragePort } from '../../shared/storage/storage.port';
import { AppointmentsRepository } from '../appointments/appointments.repository';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersRepository } from '../users/users.repository';
import { UserNotFoundError } from '../users/users.errors';
import { VeterinariansRepository } from '../veterinarians/veterinarians.repository';
import { AdminService, CannotSuspendSelfError, VetNotFoundError, VetNotPendingError } from './admin.service';

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
    getPublicUrl: vi.fn().mockReturnValue('https://minio/avatars/test.jpg'),
    ...overrides,
  };
}

const baseAdminUser = {
  id: USER_ID,
  email: 'tutor@petnalia.com',
  role: 'tutor' as const,
  status: 'active' as const,
  profile: { fullName: 'Ana Tutora' },
  createdAt: new Date('2026-01-01'),
};

function makeUsersRepo(overrides: Partial<UsersRepository> = {}) {
  return {
    findById: vi.fn().mockResolvedValue(baseAdminUser),
    update: vi.fn().mockResolvedValue(baseAdminUser),
    findAllPaginated: vi.fn().mockResolvedValue({ rows: [], total: 0 }),
    ...overrides,
  } as unknown as UsersRepository;
}

function makeAppointmentsRepo(overrides: Partial<AppointmentsRepository> = {}) {
  return {
    findAllForAdmin: vi.fn().mockResolvedValue({ rows: [], total: 0 }),
    ...overrides,
  } as unknown as AppointmentsRepository;
}

function makeService(
  vetsRepo = makeVetsRepo(),
  notifications = makeNotifications(),
  storage = makeStorage(),
  usersRepo = makeUsersRepo(),
  appointmentsRepo = makeAppointmentsRepo(),
) {
  return new AdminService(vetsRepo, notifications, storage, usersRepo, appointmentsRepo);
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

describe('AdminService.listUsers', () => {
  it('mapeia usuários para o formato paginado', async () => {
    const usersRepo = makeUsersRepo({
      findAllPaginated: vi.fn().mockResolvedValue({ rows: [baseAdminUser], total: 1 }),
    });
    const result = await makeService(makeVetsRepo(), makeNotifications(), makeStorage(), usersRepo)
      .listUsers(1, 20);

    expect(result).toEqual({
      items: [{
        id: USER_ID,
        email: 'tutor@petnalia.com',
        fullName: 'Ana Tutora',
        role: 'tutor',
        status: 'active',
        createdAt: '2026-01-01T00:00:00.000Z',
      }],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
  });
});

describe('AdminService.suspendUser', () => {
  const ADMIN_ID = 'admin-uuid-1';

  it('suspende o usuário quando ele existe', async () => {
    const usersRepo = makeUsersRepo();
    await makeService(makeVetsRepo(), makeNotifications(), makeStorage(), usersRepo)
      .suspendUser(ADMIN_ID, USER_ID);

    expect(usersRepo.update).toHaveBeenCalledWith(USER_ID, { status: 'suspended' });
  });

  it('lança CannotSuspendSelfError quando o admin tenta suspender a si mesmo', async () => {
    const service = makeService(makeVetsRepo(), makeNotifications(), makeStorage(), makeUsersRepo());
    await expect(service.suspendUser(ADMIN_ID, ADMIN_ID)).rejects.toThrow(CannotSuspendSelfError);
  });

  it('lança UserNotFoundError quando o usuário não existe', async () => {
    const usersRepo = makeUsersRepo({ findById: vi.fn().mockResolvedValue(null) });
    const service = makeService(makeVetsRepo(), makeNotifications(), makeStorage(), usersRepo);
    await expect(service.suspendUser(ADMIN_ID, USER_ID)).rejects.toThrow(UserNotFoundError);
  });
});

describe('AdminService.reactivateUser', () => {
  it('reativa o usuário quando ele existe', async () => {
    const usersRepo = makeUsersRepo();
    await makeService(makeVetsRepo(), makeNotifications(), makeStorage(), usersRepo)
      .reactivateUser(USER_ID);

    expect(usersRepo.update).toHaveBeenCalledWith(USER_ID, { status: 'active' });
  });

  it('lança UserNotFoundError quando o usuário não existe', async () => {
    const usersRepo = makeUsersRepo({ findById: vi.fn().mockResolvedValue(null) });
    const service = makeService(makeVetsRepo(), makeNotifications(), makeStorage(), usersRepo);
    await expect(service.reactivateUser(USER_ID)).rejects.toThrow(UserNotFoundError);
  });
});

describe('AdminService.listAppointments', () => {
  it('mapeia consultas para o formato paginado', async () => {
    const row = {
      id: 'apt-uuid-1',
      tutor: { email: 'tutor@petnalia.com', profile: { fullName: 'Ana Tutora' } },
      veterinarian: { user: { email: 'vet@petnalia.com', profile: { fullName: 'Dr. Bruno' } } },
      pet: { name: 'Rex' },
      status: 'confirmed' as const,
      modality: 'home' as const,
      priceCents: 15000,
      slot: { startsAt: new Date('2026-02-01T09:00:00.000Z') },
      createdAt: new Date('2026-01-15T00:00:00.000Z'),
    };
    const appointmentsRepo = makeAppointmentsRepo({
      findAllForAdmin: vi.fn().mockResolvedValue({ rows: [row], total: 1 }),
    });
    const service = makeService(makeVetsRepo(), makeNotifications(), makeStorage(), makeUsersRepo(), appointmentsRepo);

    const result = await service.listAppointments({ page: 1, limit: 20 });

    expect(result).toEqual({
      items: [{
        id: 'apt-uuid-1',
        tutorName: 'Ana Tutora',
        vetName: 'Dr. Bruno',
        petName: 'Rex',
        status: 'confirmed',
        modality: 'home',
        priceCents: 15000,
        scheduledAt: '2026-02-01T09:00:00.000Z',
        createdAt: '2026-01-15T00:00:00.000Z',
      }],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
  });

  it('repassa o filtro de status para o repositório', async () => {
    const appointmentsRepo = makeAppointmentsRepo();
    const service = makeService(makeVetsRepo(), makeNotifications(), makeStorage(), makeUsersRepo(), appointmentsRepo);

    await service.listAppointments({ page: 1, limit: 20, status: 'cancelled' });

    expect(appointmentsRepo.findAllForAdmin).toHaveBeenCalledWith({ page: 1, limit: 20, status: 'cancelled' });
  });
});
