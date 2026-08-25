import { Injectable } from '@nestjs/common';
import type {
  PetSitterOwnProfileResponse,
  PetSitterSearchQuery,
  PetSitterSearchResponse,
  PetSitterSearchResult,
  PetSitterService as PetSitterServiceTag,
  UpdatePetSitterProfileInput,
} from '@petnalia/types';

import { GeocoderService } from '../addresses/geocoder.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersRepository } from '../users/users.repository';
import { scanBioForViolation } from './bio-moderation';
import { PetSitterNotFoundError } from './pet-sitters.errors';
import { PetSittersRepository } from './pet-sitters.repository';

@Injectable()
export class PetSittersService {
  constructor(
    private readonly petSittersRepository: PetSittersRepository,
    private readonly geocoder: GeocoderService,
    private readonly notifications: NotificationsService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async search(params: PetSitterSearchQuery): Promise<PetSitterSearchResponse> {
    const { rows, totalCount } = await this.petSittersRepository.search(params);

    const data: PetSitterSearchResult[] = rows.map((row) => ({
      id: row.id,
      fullName: row.full_name,
      avatarUrl: row.avatar_url,
      bio: row.bio,
      services: row.services as PetSitterServiceTag[],
      distanceKm: row.distance_km,
      baseCity: row.base_city,
      baseState: row.base_state,
      averageRating: row.average_rating,
      totalReviews: row.total_reviews,
    }));

    return {
      data,
      total: totalCount,
      page: params.page,
      limit: params.limit,
      hasMore: params.page * params.limit < totalCount,
    };
  }

  async getOwnProfile(userId: string): Promise<PetSitterOwnProfileResponse> {
    const sitter = await this.petSittersRepository.findByUserId(userId);
    if (!sitter) throw new PetSitterNotFoundError();

    return {
      id: sitter.id,
      fullName: sitter.fullName,
      bio: sitter.bio,
      avatarUrl: sitter.avatarUrl,
      services: sitter.services as PetSitterServiceTag[],
      baseCity: sitter.baseCity,
      baseState: sitter.baseState,
    };
  }

  async updateOwnProfile(userId: string, dto: UpdatePetSitterProfileInput): Promise<void> {
    const sitter = await this.petSittersRepository.findByUserId(userId);
    if (!sitter) throw new PetSitterNotFoundError();

    const data: {
      bio?: string;
      services?: string[];
      baseCity?: string;
      baseState?: string;
      moderationStatus?: 'flagged';
      flagReason?: string;
    } = {};
    if (dto.bio !== undefined) data.bio = dto.bio;
    if (dto.services !== undefined) data.services = dto.services;
    if (dto.baseCity !== undefined) data.baseCity = dto.baseCity;
    if (dto.baseState !== undefined) data.baseState = dto.baseState.toUpperCase();

    // Bios are the only free-text field on a pet sitter profile — services are a
    // closed enum with no medical option — so this is the only place a veterinarian
    // could advertise clinical services under a free listing to dodge the paid vet
    // tier. Flagging never blocks the save and is invisible to the sitter; only a
    // confirmed violation (admin review) notifies them. See bio-moderation.ts.
    //
    // Re-flagging is keyed off whether the bio text actually changed, not just
    // the current moderation status: resubmitting the same unfixed bio (e.g. the
    // profile form re-sends bio on every save) must not spam admins again while
    // a review is already pending, but a genuine edit that still violates —
    // even after a prior confirmed_violation — must surface again so reincidência
    // isn't invisible to admins going forward.
    let notifyAdmins: string | undefined;
    let isRepeatOffense = false;
    if (data.bio !== undefined) {
      const violation = scanBioForViolation(data.bio);
      const bioChanged = data.bio !== sitter.bio;
      const pendingReview = sitter.moderationStatus === 'flagged';
      if (violation) {
        data.flagReason = violation;
        if (bioChanged && !pendingReview) {
          data.moderationStatus = 'flagged';
          notifyAdmins = violation;
          isRepeatOffense = sitter.moderationStatus === 'confirmed_violation';
        }
      }
    }

    let geoPoint: { lat: number; lng: number } | undefined;
    if (data.baseCity && data.baseState) {
      const suggestions = await this.geocoder.suggestPlaces(`${data.baseCity}, ${data.baseState}, Brasil`, 1);
      if (suggestions[0]) geoPoint = { lat: suggestions[0].lat, lng: suggestions[0].lng };
    }

    await this.petSittersRepository.updateOwnProfile(userId, data, geoPoint);

    if (notifyAdmins) {
      const admins = await this.usersRepository.findAllByRole('admin');
      for (const admin of admins) {
        void this.notifications.enqueueEmail({
          to: admin.email,
          type: 'pet_sitter_bio_flagged',
          name: admin.profile?.fullName ?? admin.email,
          flaggedSitterName: sitter.fullName,
          reason: notifyAdmins,
          isRepeatOffense,
        });
      }
    }
  }
}
