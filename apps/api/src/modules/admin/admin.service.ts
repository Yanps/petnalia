import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import type {
  AdminAppointmentListResponse,
  AdminAppointmentsQuery,
  AdminUserListResponse,
  FlaggedPetSitterListResponse,
  ReviewedPetSitterListResponse,
} from '@petnalia/types';

import { DomainError } from '../../shared/errors/domain.error';
import { STORAGE_PORT, type StoragePort } from '../../shared/storage/storage.port';
import { AppointmentsRepository } from '../appointments/appointments.repository';
import { NotificationsService } from '../notifications/notifications.service';
import { PetSitterNotFlaggedError, PetSitterNotFoundError } from '../pet-sitters/pet-sitters.errors';
import { PetSittersRepository } from '../pet-sitters/pet-sitters.repository';
import { UsersRepository } from '../users/users.repository';
import { UserNotFoundError } from '../users/users.errors';
import { VeterinariansRepository } from '../veterinarians/veterinarians.repository';

export class VetNotFoundError extends DomainError {
  constructor() {
    super('VETERINARIAN_NOT_FOUND', 'Veterinário não encontrado.', HttpStatus.NOT_FOUND);
  }
}

export class VetNotPendingError extends DomainError {
  constructor() {
    super(
      'VETERINARIAN_NOT_PENDING',
      'Este veterinário não está aguardando verificação.',
      HttpStatus.CONFLICT,
    );
  }
}

export class CannotSuspendSelfError extends DomainError {
  constructor() {
    super(
      'ADMIN_CANNOT_SUSPEND_SELF',
      'Você não pode suspender a própria conta.',
      HttpStatus.CONFLICT,
    );
  }
}

@Injectable()
export class AdminService {
  constructor(
    private readonly vetsRepo: VeterinariansRepository,
    private readonly notifications: NotificationsService,
    @Inject(STORAGE_PORT) private readonly storage: StoragePort,
    private readonly usersRepo: UsersRepository,
    private readonly appointmentsRepo: AppointmentsRepository,
    private readonly petSittersRepo: PetSittersRepository,
  ) {}

  async listPendingVets(page: number, limit: number) {
    const { rows, total } = await this.vetsRepo.findPendingVets(page, limit);

    const data = await Promise.all(
      rows.map(async (r) => ({
        id: r.vet_id,
        userId: r.user_id,
        fullName: r.full_name,
        email: r.email,
        crmv: r.crmv,
        crmvState: r.crmv_state,
        crmvPhotoUrl: r.crmv_photo_key
          ? await this.storage.getPresignedUrl(r.crmv_photo_key, 3600)
          : null,
        createdAt: r.created_at.toISOString(),
      })),
    );

    return { data, total, page, limit, hasMore: page * limit < total };
  }

  async approveVet(vetId: string): Promise<void> {
    const vet = await this.vetsRepo.findVetWithUser(vetId);
    if (!vet) throw new VetNotFoundError();
    if (vet.verificationStatus !== 'pending' && vet.verificationStatus !== 'in_review') {
      throw new VetNotPendingError();
    }
    await this.vetsRepo.updateVerificationStatus(vetId, 'verified');

    void this.notifications.enqueueEmail({
      to: vet.user.email,
      type: 'vet_approved',
      name: vet.user.profile?.fullName ?? vet.user.email,
    });
  }

  async rejectVet(vetId: string, reason: string): Promise<void> {
    const vet = await this.vetsRepo.findVetWithUser(vetId);
    if (!vet) throw new VetNotFoundError();
    if (vet.verificationStatus !== 'pending' && vet.verificationStatus !== 'in_review') {
      throw new VetNotPendingError();
    }
    await this.vetsRepo.updateVerificationStatus(vetId, 'rejected', reason);

    void this.notifications.enqueueEmail({
      to: vet.user.email,
      type: 'vet_rejected',
      name: vet.user.profile?.fullName ?? vet.user.email,
      reason,
    });
  }

  async listUsers(page: number, limit: number): Promise<AdminUserListResponse> {
    const { rows, total } = await this.usersRepo.findAllPaginated(page, limit);

    return {
      items: rows.map((u) => ({
        id: u.id,
        email: u.email,
        fullName: u.profile?.fullName ?? u.email,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async suspendUser(adminId: string, userId: string): Promise<void> {
    if (adminId === userId) throw new CannotSuspendSelfError();

    const user = await this.usersRepo.findById(userId);
    if (!user) throw new UserNotFoundError();

    await this.usersRepo.update(userId, { status: 'suspended' });
  }

  async reactivateUser(userId: string): Promise<void> {
    const user = await this.usersRepo.findById(userId);
    if (!user) throw new UserNotFoundError();

    await this.usersRepo.update(userId, { status: 'active' });
  }

  async listAppointments(query: AdminAppointmentsQuery): Promise<AdminAppointmentListResponse> {
    const { rows, total } = await this.appointmentsRepo.findAllForAdmin(query);

    return {
      items: rows.map((a) => ({
        id: a.id,
        tutorName: a.tutor.profile?.fullName ?? a.tutor.email,
        vetName: a.veterinarian.user.profile?.fullName ?? a.veterinarian.user.email,
        petName: a.pet.name,
        status: a.status,
        modality: a.modality,
        priceCents: a.priceCents,
        scheduledAt: a.slot.startsAt.toISOString(),
        createdAt: a.createdAt.toISOString(),
      })),
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  async listFlaggedPetSitters(page: number, limit: number): Promise<FlaggedPetSitterListResponse> {
    const { rows, total } = await this.petSittersRepo.findFlaggedPaginated(page, limit);

    return {
      items: rows.map((s) => ({
        id: s.id,
        fullName: s.fullName,
        bio: s.bio,
        flagReason: s.flagReason,
        violationCount: s.violationCount,
        updatedAt: s.updatedAt.toISOString(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async listReviewedPetSitters(page: number, limit: number): Promise<ReviewedPetSitterListResponse> {
    const { rows, total } = await this.petSittersRepo.findReviewedPaginated(page, limit);

    return {
      items: rows.map((s) => ({
        id: s.id,
        fullName: s.fullName,
        moderationStatus: s.moderationStatus,
        flagReason: s.flagReason,
        moderatorNote: s.moderatorNote,
        violationCount: s.violationCount,
        updatedAt: s.updatedAt.toISOString(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /** A second confirmed violation auto-suspends the account — the first
   * offense only gets a warning email asking for a correction (see
   * pet_sitter_bio_violation), since one keyword match can be a misjudged
   * borderline case, but a repeat after an explicit warning is deliberate. */
  async confirmPetSitterViolation(petSitterId: string, moderatorNote?: string): Promise<void> {
    const sitter = await this.petSittersRepo.findWithUser(petSitterId);
    if (!sitter) throw new PetSitterNotFoundError();
    if (sitter.moderationStatus !== 'flagged') throw new PetSitterNotFlaggedError();

    const updated = await this.petSittersRepo.confirmViolation(petSitterId, moderatorNote);
    const reason = moderatorNote ?? sitter.flagReason;

    if (updated.violationCount >= 2) {
      await this.usersRepo.update(sitter.userId, { status: 'suspended' });
      void this.notifications.enqueueEmail({
        to: sitter.user.email,
        type: 'pet_sitter_suspended',
        name: sitter.user.profile?.fullName ?? sitter.user.email,
        ...(reason && { reason }),
      });
      return;
    }

    void this.notifications.enqueueEmail({
      to: sitter.user.email,
      type: 'pet_sitter_bio_violation',
      name: sitter.user.profile?.fullName ?? sitter.user.email,
      ...(reason && { reason }),
    });
  }

  async dismissPetSitterFlag(petSitterId: string, moderatorNote?: string): Promise<void> {
    const sitter = await this.petSittersRepo.findWithUser(petSitterId);
    if (!sitter) throw new PetSitterNotFoundError();
    if (sitter.moderationStatus !== 'flagged') throw new PetSitterNotFlaggedError();

    // Dismissed as a false positive — the sitter was never aware of the flag,
    // so no notification is sent here (unlike a confirmed violation), and the
    // violation count (used to decide auto-suspension) is not incremented.
    await this.petSittersRepo.dismissFlag(petSitterId, moderatorNote);
  }
}
