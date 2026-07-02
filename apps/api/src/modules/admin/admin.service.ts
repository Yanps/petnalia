import { HttpStatus, Injectable } from '@nestjs/common';

import { DomainError } from '../../shared/errors/domain.error';
import { NotificationsService } from '../notifications/notifications.service';
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

@Injectable()
export class AdminService {
  constructor(
    private readonly vetsRepo: VeterinariansRepository,
    private readonly notifications: NotificationsService,
  ) {}

  async listPendingVets(page: number, limit: number) {
    const { rows, total } = await this.vetsRepo.findPendingVets(page, limit);
    return {
      data: rows.map((r) => ({
        id: r.vet_id,
        userId: r.user_id,
        fullName: r.full_name,
        email: r.email,
        crmv: r.crmv,
        crmvState: r.crmv_state,
        createdAt: r.created_at.toISOString(),
      })),
      total,
      page,
      limit,
      hasMore: page * limit < total,
    };
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
}
