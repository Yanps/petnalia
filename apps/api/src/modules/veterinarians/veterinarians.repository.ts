import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { UpdateVetProfileInput, VetSearchQuery } from '@petnalia/types';

import { PrismaService } from '../../shared/prisma/prisma.service';

interface RawPendingVet {
  vet_id: string;
  user_id: string;
  full_name: string;
  email: string;
  crmv: string;
  crmv_state: string;
  created_at: Date;
}

interface RawOwnProfile {
  vet_id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  crmv: string;
  crmv_state: string;
  verification_status: string;
  tier: string;
  service_radius_km: number;
  specialties: Array<{ id: string; name: string; slug: string }> | null;
}

interface RawVetProfile {
  vet_id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  crmv: string;
  crmv_state: string;
  verification_status: string;
  tier: string;
  service_radius_km: number;
  base_city: string | null;
  base_state: string | null;
  average_rating: number;
  total_reviews: number;
  specialties: Array<{ id: string; name: string; slug: string }> | null;
}

interface RawVetRow {
  vet_id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  verification_status: string;
  tier: string;
  service_radius_km: number;
  base_city: string;
  base_state: string;
  distance_km: number;
  average_rating: number;
  total_reviews: number;
  total_count: bigint;
  specialties: Array<{ id: string; name: string; slug: string }> | null;
}

@Injectable()
export class VeterinariansRepository {
  constructor(private readonly prisma: PrismaService) {}

  async search(params: VetSearchQuery): Promise<{ rows: RawVetRow[]; totalCount: number }> {
    const offset = (params.page - 1) * params.limit;
    const radiusMeters = params.radiusKm * 1000;

    const specialtyFilter = params.specialtyId
      ? Prisma.sql`AND EXISTS (
          SELECT 1 FROM veterinarian_specialties vs2
          WHERE vs2."veterinarianId" = v.id
            AND vs2."specialtyId" = ${params.specialtyId}::uuid
        )`
      : Prisma.empty;

    const rows = await this.prisma.$queryRaw<RawVetRow[]>`
      WITH vet_addr AS (
        SELECT DISTINCT ON ("userId")
          "userId", city, state, geog
        FROM addresses
        WHERE geog IS NOT NULL
        ORDER BY "userId", "createdAt" ASC
      )
      SELECT
        v.id::text                                                  AS vet_id,
        p."fullName"                                                AS full_name,
        p."avatarUrl"                                               AS avatar_url,
        v.bio,
        v."verificationStatus"                                      AS verification_status,
        v.tier,
        v."serviceRadiusKm"                                         AS service_radius_km,
        a.city                                                      AS base_city,
        a.state                                                     AS base_state,
        ROUND(
          (ST_Distance(
            a.geog::geography,
            ST_SetSRID(ST_MakePoint(${params.lng}::float8, ${params.lat}::float8), 4326)::geography
          ) / 1000.0)::numeric, 1
        )::float8                                                   AS distance_km,
        COALESCE(AVG(r.rating), 0)::float8                          AS average_rating,
        COUNT(DISTINCT r.id)::int                                   AS total_reviews,
        COUNT(*) OVER ()::int                                       AS total_count,
        COALESCE(
          JSON_AGG(DISTINCT JSONB_BUILD_OBJECT(
            'id',   s.id::text,
            'name', s.name,
            'slug', s.slug
          )) FILTER (WHERE s.id IS NOT NULL),
          '[]'::json
        )                                                           AS specialties
      FROM veterinarians v
      JOIN users u         ON u.id       = v."userId" AND u.status = 'active'
      JOIN profiles p      ON p."userId" = u.id
      JOIN vet_addr a      ON a."userId" = v."userId"
      LEFT JOIN reviews r  ON r."veterinarianId" = v.id
      LEFT JOIN veterinarian_specialties vs ON vs."veterinarianId" = v.id
      LEFT JOIN specialties s               ON s.id = vs."specialtyId"
      WHERE v."verificationStatus" = 'verified'
        AND v."deletedAt" IS NULL
        AND ST_DWithin(
          a.geog::geography,
          ST_SetSRID(ST_MakePoint(${params.lng}::float8, ${params.lat}::float8), 4326)::geography,
          ${radiusMeters}::float8
        )
        ${specialtyFilter}
      GROUP BY
        v.id, p."fullName", p."avatarUrl", v.bio,
        v."verificationStatus", v.tier, v."serviceRadiusKm",
        a.city, a.state, a.geog
      ORDER BY distance_km ASC
      LIMIT ${params.limit} OFFSET ${offset}
    `;

    const totalCount = rows.length > 0 ? Number(rows[0]!.total_count) : 0;
    return { rows, totalCount };
  }

  async findProfileBySlug(slug: string): Promise<RawVetProfile | null> {
    if (slug.length < 9) return null;
    const idPrefix = slug.slice(-8) + '%';

    const rows = await this.prisma.$queryRaw<RawVetProfile[]>`
      WITH vet_addr AS (
        SELECT DISTINCT ON ("userId")
          "userId", city, state
        FROM addresses
        ORDER BY "userId", "createdAt" ASC
      )
      SELECT
        v.id::text                                                    AS vet_id,
        p."fullName"                                                  AS full_name,
        p."avatarUrl"                                                 AS avatar_url,
        v.bio,
        v.crmv,
        v."crmvState"                                                 AS crmv_state,
        v."verificationStatus"                                        AS verification_status,
        v.tier,
        v."serviceRadiusKm"                                           AS service_radius_km,
        a.city                                                        AS base_city,
        a.state                                                       AS base_state,
        COALESCE(AVG(r.rating), 0)::float8                            AS average_rating,
        COUNT(DISTINCT r.id)::int                                     AS total_reviews,
        COALESCE(
          JSON_AGG(DISTINCT JSONB_BUILD_OBJECT(
            'id',   s.id::text,
            'name', s.name,
            'slug', s.slug
          )) FILTER (WHERE s.id IS NOT NULL),
          '[]'::json
        )                                                             AS specialties
      FROM veterinarians v
      JOIN users u         ON u.id       = v."userId" AND u.status = 'active'
      JOIN profiles p      ON p."userId" = u.id
      LEFT JOIN vet_addr a ON a."userId" = v."userId"
      LEFT JOIN reviews r  ON r."veterinarianId" = v.id
      LEFT JOIN veterinarian_specialties vs ON vs."veterinarianId" = v.id
      LEFT JOIN specialties s               ON s.id = vs."specialtyId"
      WHERE v.id::text LIKE ${idPrefix}
        AND v."verificationStatus" = 'verified'
        AND v."deletedAt" IS NULL
      GROUP BY
        v.id, p."fullName", p."avatarUrl", v.bio,
        v.crmv, v."crmvState",
        v."verificationStatus", v.tier, v."serviceRadiusKm",
        a.city, a.state
      LIMIT 1
    `;

    return rows[0] ?? null;
  }

  async findOwnProfile(userId: string): Promise<RawOwnProfile | null> {
    const rows = await this.prisma.$queryRaw<RawOwnProfile[]>`
      SELECT
        v.id::text                                                    AS vet_id,
        u.id::text                                                    AS user_id,
        p."fullName"                                                  AS full_name,
        p."avatarUrl"                                                 AS avatar_url,
        v.bio,
        v.crmv,
        v."crmvState"                                                 AS crmv_state,
        v."verificationStatus"                                        AS verification_status,
        v.tier,
        v."serviceRadiusKm"                                           AS service_radius_km,
        COALESCE(
          JSON_AGG(DISTINCT JSONB_BUILD_OBJECT(
            'id',   s.id::text,
            'name', s.name,
            'slug', s.slug
          )) FILTER (WHERE s.id IS NOT NULL),
          '[]'::json
        )                                                             AS specialties
      FROM veterinarians v
      JOIN users u         ON u.id       = v."userId"
      JOIN profiles p      ON p."userId" = u.id
      LEFT JOIN veterinarian_specialties vs ON vs."veterinarianId" = v.id
      LEFT JOIN specialties s               ON s.id = vs."specialtyId"
      WHERE v."userId" = ${userId}::uuid
        AND v."deletedAt" IS NULL
      GROUP BY
        v.id, u.id, p."fullName", p."avatarUrl", v.bio,
        v.crmv, v."crmvState",
        v."verificationStatus", v.tier, v."serviceRadiusKm"
      LIMIT 1
    `;

    return rows[0] ?? null;
  }

  async findAllSpecialties() {
    return this.prisma.specialty.findMany({ orderBy: { name: 'asc' } });
  }

  async findPendingVets(page: number, limit: number) {
    const offset = (page - 1) * limit;
    const rows = await this.prisma.$queryRaw<RawPendingVet[]>`
      SELECT
        v.id::text   AS vet_id,
        u.id::text   AS user_id,
        p."fullName" AS full_name,
        u.email,
        v.crmv,
        v."crmvState" AS crmv_state,
        v."createdAt" AS created_at
      FROM veterinarians v
      JOIN users u    ON u.id = v."userId"
      JOIN profiles p ON p."userId" = u.id
      WHERE v."verificationStatus" = 'pending'
        AND v."deletedAt" IS NULL
      ORDER BY v."createdAt" ASC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countRows = await this.prisma.$queryRaw<[{ total: bigint }]>`
      SELECT COUNT(*) AS total FROM veterinarians WHERE "verificationStatus" = 'pending' AND "deletedAt" IS NULL
    `;
    const total = Number(countRows[0]?.total ?? 0);

    return { rows, total };
  }

  async findVetById(vetId: string) {
    return this.prisma.veterinarian.findUnique({ where: { id: vetId } });
  }

  async findVetWithUser(vetId: string) {
    return this.prisma.veterinarian.findUnique({
      where: { id: vetId },
      include: { user: { include: { profile: true } } },
    });
  }

  async updateVerificationStatus(
    vetId: string,
    status: 'verified' | 'rejected',
    rejectionReason?: string,
  ): Promise<void> {
    await this.prisma.veterinarian.update({
      where: { id: vetId },
      data: {
        verificationStatus: status,
        ...(rejectionReason !== undefined ? { rejectionReason } : {}),
      },
    });
  }

  async updateProfile(userId: string, data: UpdateVetProfileInput): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const vet = await tx.veterinarian.update({
        where: { userId },
        data: {
          ...(data.bio !== undefined && { bio: data.bio }),
          ...(data.serviceRadiusKm && { serviceRadiusKm: data.serviceRadiusKm }),
        },
      });

      if (data.specialtyIds !== undefined) {
        await tx.veterinarianSpecialty.deleteMany({ where: { veterinarianId: vet.id } });
        if (data.specialtyIds.length > 0) {
          await tx.veterinarianSpecialty.createMany({
            data: data.specialtyIds.map((sId) => ({
              veterinarianId: vet.id,
              specialtyId: sId,
            })),
          });
        }
      }
    });
  }
}
