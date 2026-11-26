import { describe, expect, it, vi } from 'vitest';

import { AdminService, CannotSuspendSelfError, VetNotFoundError, VetNotPendingError } from './admin.service';
import type { StoragePort } from '../../shared/storage/storage.port';
import type { AppointmentsRepository } from '../appointments/appointments.repository';
import type { NotificationsService } from '../notifications/notifications.service';
import { PetSitterNotFlaggedError, PetSitterNotFoundError } from '../pet-sitters/pet-sitters.errors';
import type { PetSittersRepository } from '../pet-sitters/pet-sitters.repository';
import { UserNotFoundError } from '../users/users.errors';
import type { UsersRepository } from '../users/users.repository';
import type { VeterinariansRepository } from '../veterinarians/veterinarians.repository';


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

function makePetSittersRepo(overrides: Partial<PetSittersRepository> = {}) {
  return {
    findFlaggedPaginated: vi.fn().mockResolvedValue({ rows: [], total: 0 }),
    findReviewedPaginated: vi.fn().mockResolvedValue({ rows: [], total: 0 }),
    findWithUser: vi.fn().mockResolvedValue(null),
    confirmViolation: vi.fn().mockResolvedValue({ violationCount: 1 }),
    dismissFlag: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as PetSittersRepository;
}

function makeService(
  vetsRepo = makeVetsRepo(),
  notifications = makeNotifications(),
  storage = makeStorage(),
  usersRepo = makeUsersRepo(),
  appointmentsRepo = makeAppointmentsRepo(),
  petSittersRepo = makePetSittersRepo(),
) {
  return new AdminService(vetsRepo, notifications, storage, usersRepo, appointmentsRepo, petSittersRepo);
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

const SITTER_ID = 'sitter-uuid-1';
const SITTER_USER_ID = 'sitter-user-uuid-1';

const baseFlaggedSitter = {
  id: SITTER_ID,
  userId: SITTER_USER_ID,
  fullName: 'Carla Sitter',
  moderationStatus: 'flagged' as const,
  flagReason: 'crmv',
  violationCount: 0,
  user: {
    email: 'carla@petnalia.com',
    profile: { fullName: 'Carla Sitter' },
  },
};

describe('AdminService.listFlaggedPetSitters', () => {
  it('mapeia os campos esperados, incluindo violationCount', async () => {
    const petSittersRepo = makePetSittersRepo({
      findFlaggedPaginated: vi.fn().mockResolvedValue({
        rows: [{ id: SITTER_ID, fullName: 'Carla Sitter', bio: 'bio suspeita', flagReason: 'crmv', violationCount: 1, updatedAt: new Date('2026-01-10') }],
        total: 1,
      }),
    });
    const service = makeService(makeVetsRepo(), makeNotifications(), makeStorage(), makeUsersRepo(), makeAppointmentsRepo(), petSittersRepo);

    const result = await service.listFlaggedPetSitters(1, 20);

    expect(result.items).toEqual([{
      id: SITTER_ID,
      fullName: 'Carla Sitter',
      bio: 'bio suspeita',
      flagReason: 'crmv',
      violationCount: 1,
      updatedAt: '2026-01-10T00:00:00.000Z',
    }]);
    expect(result.total).toBe(1);
  });
});

describe('AdminService.listReviewedPetSitters', () => {
  it('mapeia perfis já revisados (confirmados ou descartados)', async () => {
    const petSittersRepo = makePetSittersRepo({
      findReviewedPaginated: vi.fn().mockResolvedValue({
        rows: [{
          id: SITTER_ID, fullName: 'Carla Sitter', moderationStatus: 'confirmed_violation',
          flagReason: 'crmv', moderatorNote: 'Remova a menção', violationCount: 1, updatedAt: new Date('2026-01-10'),
        }],
        total: 1,
      }),
    });
    const service = makeService(makeVetsRepo(), makeNotifications(), makeStorage(), makeUsersRepo(), makeAppointmentsRepo(), petSittersRepo);

    const result = await service.listReviewedPetSitters(1, 20);

    expect(result.items[0]).toEqual({
      id: SITTER_ID,
      fullName: 'Carla Sitter',
      moderationStatus: 'confirmed_violation',
      flagReason: 'crmv',
      moderatorNote: 'Remova a menção',
      violationCount: 1,
      updatedAt: '2026-01-10T00:00:00.000Z',
    });
  });
});

describe('AdminService.confirmPetSitterViolation', () => {
  it('lança PetSitterNotFoundError quando o perfil não existe', async () => {
    const petSittersRepo = makePetSittersRepo({ findWithUser: vi.fn().mockResolvedValue(null) });
    const service = makeService(makeVetsRepo(), makeNotifications(), makeStorage(), makeUsersRepo(), makeAppointmentsRepo(), petSittersRepo);

    await expect(service.confirmPetSitterViolation(SITTER_ID)).rejects.toThrow(PetSitterNotFoundError);
  });

  it('lança PetSitterNotFlaggedError quando o perfil não está sinalizado', async () => {
    const petSittersRepo = makePetSittersRepo({
      findWithUser: vi.fn().mockResolvedValue({ ...baseFlaggedSitter, moderationStatus: 'clean' }),
    });
    const service = makeService(makeVetsRepo(), makeNotifications(), makeStorage(), makeUsersRepo(), makeAppointmentsRepo(), petSittersRepo);

    await expect(service.confirmPetSitterViolation(SITTER_ID)).rejects.toThrow(PetSitterNotFlaggedError);
  });

  it('na 1ª violação confirmada, envia e-mail de aviso e não suspende a conta', async () => {
    const notifications = makeNotifications();
    const usersRepo = makeUsersRepo();
    const petSittersRepo = makePetSittersRepo({
      findWithUser: vi.fn().mockResolvedValue(baseFlaggedSitter),
      confirmViolation: vi.fn().mockResolvedValue({ ...baseFlaggedSitter, violationCount: 1 }),
    });
    const service = makeService(makeVetsRepo(), notifications, makeStorage(), usersRepo, makeAppointmentsRepo(), petSittersRepo);

    await service.confirmPetSitterViolation(SITTER_ID, 'Remova a menção ao CRMV');

    expect(petSittersRepo.confirmViolation).toHaveBeenCalledWith(SITTER_ID, 'Remova a menção ao CRMV');
    expect(usersRepo.update).not.toHaveBeenCalled();
    expect(notifications.enqueueEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'carla@petnalia.com',
      type: 'pet_sitter_bio_violation',
      reason: 'Remova a menção ao CRMV',
    }));
  });

  it('na 2ª violação confirmada, suspende a conta e envia e-mail de suspensão', async () => {
    const notifications = makeNotifications();
    const usersRepo = makeUsersRepo();
    const petSittersRepo = makePetSittersRepo({
      findWithUser: vi.fn().mockResolvedValue(baseFlaggedSitter),
      confirmViolation: vi.fn().mockResolvedValue({ ...baseFlaggedSitter, violationCount: 2 }),
    });
    const service = makeService(makeVetsRepo(), notifications, makeStorage(), usersRepo, makeAppointmentsRepo(), petSittersRepo);

    await service.confirmPetSitterViolation(SITTER_ID);

    expect(usersRepo.update).toHaveBeenCalledWith(SITTER_USER_ID, { status: 'suspended' });
    expect(notifications.enqueueEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'carla@petnalia.com',
      type: 'pet_sitter_suspended',
    }));
    expect(notifications.enqueueEmail).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'pet_sitter_bio_violation' }));
  });
});

describe('AdminService.dismissPetSitterFlag', () => {
  it('lança PetSitterNotFlaggedError quando o perfil não está sinalizado', async () => {
    const petSittersRepo = makePetSittersRepo({
      findWithUser: vi.fn().mockResolvedValue({ ...baseFlaggedSitter, moderationStatus: 'dismissed' }),
    });
    const service = makeService(makeVetsRepo(), makeNotifications(), makeStorage(), makeUsersRepo(), makeAppointmentsRepo(), petSittersRepo);

    await expect(service.dismissPetSitterFlag(SITTER_ID)).rejects.toThrow(PetSitterNotFlaggedError);
  });

  it('descarta a sinalização sem notificar o sitter nem incrementar violações', async () => {
    const notifications = makeNotifications();
    const petSittersRepo = makePetSittersRepo({ findWithUser: vi.fn().mockResolvedValue(baseFlaggedSitter) });
    const service = makeService(makeVetsRepo(), notifications, makeStorage(), makeUsersRepo(), makeAppointmentsRepo(), petSittersRepo);

    await service.dismissPetSitterFlag(SITTER_ID, 'Falso positivo — tosa criativa');

    expect(petSittersRepo.dismissFlag).toHaveBeenCalledWith(SITTER_ID, 'Falso positivo — tosa criativa');
    expect(notifications.enqueueEmail).not.toHaveBeenCalled();
  });
});
