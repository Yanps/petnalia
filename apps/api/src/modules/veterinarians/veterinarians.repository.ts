import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { VetSearchQuery } from '@petnalia/types';

import { PrismaService } from '../../shared/prisma/prisma.service';

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
}
