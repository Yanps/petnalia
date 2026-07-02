import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import type {
  Specialty,
  UpdateVetProfileInput,
  VetOwnProfileResponse,
  VetProfilePublicResponse,
  VetSearchQuery,
  VetSearchResponse,
  VetSearchResult,
} from '@petnalia/types';

import { DomainError } from '../../shared/errors/domain.error';
import { STORAGE_PORT, type StoragePort } from '../../shared/storage/storage.port';
import { VeterinarianNotFoundError } from './veterinarians.errors';
import { VeterinariansRepository } from './veterinarians.repository';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
const AVATAR_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export class InvalidCrmvPhotoError extends DomainError {
  constructor(msg: string) {
    super('INVALID_CRMV_PHOTO', msg, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}

function toSlug(fullName: string, id: string): string {
  const base = fullName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return `${base}-${id.substring(0, 8)}`;
}

@Injectable()
export class VeterinariansService {
  constructor(
    private readonly vetsRepository: VeterinariansRepository,
    @Inject(STORAGE_PORT) private readonly storage: StoragePort,
  ) {}

  async search(params: VetSearchQuery): Promise<VetSearchResponse> {
    const { rows, totalCount } = await this.vetsRepository.search(params);

    const data: VetSearchResult[] = rows.map((row) => ({
      id: row.vet_id,
      slug: toSlug(row.full_name, row.vet_id),
      fullName: row.full_name,
      avatarUrl: row.avatar_url,
      bio: row.bio,
      specialties: row.specialties ?? [],
      averageRating: row.average_rating,
      totalReviews: row.total_reviews,
      distanceKm: row.distance_km,
      baseCity: row.base_city,
      baseState: row.base_state,
      serviceRadiusKm: row.service_radius_km,
      verificationStatus: row.verification_status as VetSearchResult['verificationStatus'],
      tier: row.tier as VetSearchResult['tier'],
    }));

    return {
      data,
      total: totalCount,
      page: params.page,
      limit: params.limit,
      hasMore: params.page * params.limit < totalCount,
    };
  }

  async getProfile(slug: string): Promise<VetProfilePublicResponse> {
    const row = await this.vetsRepository.findProfileBySlug(slug);
    if (!row) throw new VeterinarianNotFoundError();

    return {
      id: row.vet_id,
      slug,
      fullName: row.full_name,
      avatarUrl: row.avatar_url,
      bio: row.bio,
      specialties: row.specialties ?? [],
      crmv: row.crmv,
      crmvState: row.crmv_state,
      averageRating: row.average_rating,
      totalReviews: row.total_reviews,
      verificationStatus: row.verification_status as VetProfilePublicResponse['verificationStatus'],
      tier: row.tier as VetProfilePublicResponse['tier'],
      baseCity: row.base_city ?? '',
      baseState: row.base_state ?? '',
      serviceRadiusKm: row.service_radius_km,
    };
  }

  async getOwnProfile(userId: string): Promise<VetOwnProfileResponse> {
    const row = await this.vetsRepository.findOwnProfile(userId);
    if (!row) throw new VeterinarianNotFoundError();

    return {
      id: row.vet_id,
      slug: toSlug(row.full_name, row.vet_id),
      fullName: row.full_name,
      avatarUrl: row.avatar_url,
      bio: row.bio,
      specialties: row.specialties ?? [],
      crmv: row.crmv,
      crmvState: row.crmv_state,
      averageRating: 0,
      totalReviews: 0,
      verificationStatus: row.verification_status as VetOwnProfileResponse['verificationStatus'],
      tier: row.tier as VetOwnProfileResponse['tier'],
      baseCity: '',
      baseState: '',
      serviceRadiusKm: row.service_radius_km,
      crmvPhotoUploaded: row.has_crmv_photo,
    };
  }

  async updateOwnProfile(userId: string, input: UpdateVetProfileInput): Promise<void> {
    await this.vetsRepository.updateProfile(userId, input);
  }

  async listSpecialties(): Promise<Specialty[]> {
    return this.vetsRepository.findAllSpecialties();
  }

  async uploadCrmvPhoto(
    userId: string,
    file: { buffer: Buffer; mimetype: string; size: number; originalname: string },
  ): Promise<{ photoUrl: string }> {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      throw new InvalidCrmvPhotoError('Formato inválido. Envie JPEG, PNG, WebP ou PDF.');
    }
    if (file.size > MAX_SIZE_BYTES) {
      throw new InvalidCrmvPhotoError('Arquivo muito grande. Máximo 5 MB.');
    }

    const ext = file.originalname.split('.').pop() ?? 'jpg';
    const key = `crmv/${userId}/${Date.now()}.${ext}`;

    await this.storage.putObject(key, file.buffer, file.mimetype);
    await this.vetsRepository.updateCrmvPhoto(userId, key);

    const photoUrl = await this.storage.getPresignedUrl(key, 3600);
    return { photoUrl };
  }

  async getCrmvPhotoUrl(vetId: string): Promise<string | null> {
    const vet = await this.vetsRepository.findVetById(vetId);
    if (!vet?.crmvPhotoKey) return null;
    return this.storage.getPresignedUrl(vet.crmvPhotoKey, 3600);
  }

  async uploadAvatar(
    userId: string,
    file: { buffer: Buffer; mimetype: string; size: number; originalname: string },
  ): Promise<{ avatarUrl: string }> {
    if (!AVATAR_MIME.has(file.mimetype)) {
      throw new InvalidCrmvPhotoError('Formato inválido. Envie JPEG, PNG ou WebP.');
    }
    if (file.size > MAX_SIZE_BYTES) {
      throw new InvalidCrmvPhotoError('Arquivo muito grande. Máximo 5 MB.');
    }

    const ext = file.originalname.split('.').pop() ?? 'jpg';
    const key = `avatars/${userId}/${Date.now()}.${ext}`;

    await this.storage.putObject(key, file.buffer, file.mimetype);

    const avatarUrl = this.storage.getPublicUrl(key);
    await this.vetsRepository.updateAvatarUrl(userId, avatarUrl);

    return { avatarUrl };
  }
}
