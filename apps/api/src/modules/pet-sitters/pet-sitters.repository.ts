import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import type { PetSitterSearchQuery } from '@petnalia/types';

import { PrismaService } from '../../shared/prisma/prisma.service';

interface RawPetSitterRow {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  services: string[];
  base_city: string;
  base_state: string;
  distance_km: number;
  average_rating: number;
  total_reviews: number;
  total_count: bigint | number;
}

interface RawPetSitterProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  services: string[];
  base_city: string | null;
  base_state: string | null;
  average_rating: number;
  total_reviews: number;
}

@Injectable()
export class PetSittersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async search(params: PetSitterSearchQuery): Promise<{ rows: RawPetSitterRow[]; totalCount: number }> {
    const offset = (params.page - 1) * params.limit;
    const radiusMeters = params.radiusKm * 1000;

    const servicesFilter = params.services?.length
      ? Prisma.sql`AND ps.services && ${params.services}::text[]`
      : Prisma.empty;

    const textFilter = params.q
      ? Prisma.sql`AND (
          ps."fullName" ILIKE ${'%' + params.q + '%'}
          OR ps.bio ILIKE ${'%' + params.q + '%'}
        )`
      : Prisma.empty;

    const rows = await this.prisma.$queryRaw<RawPetSitterRow[]>`
      SELECT
        ps.id::text                                                 AS id,
        ps."fullName"                                               AS full_name,
        ps."avatarUrl"                                              AS avatar_url,
        ps.bio,
        ps.services,
        ps."baseCity"                                               AS base_city,
        ps."baseState"                                              AS base_state,
        ROUND(
          (ST_Distance(
            ps.geog::geography,
            ST_SetSRID(ST_MakePoint(${params.lng}::float8, ${params.lat}::float8), 4326)::geography
          ) / 1000.0)::numeric, 1
        )::float8                                                   AS distance_km,
        COALESCE(AVG(r.rating), 0)::float8                          AS average_rating,
        COUNT(DISTINCT r.id)::int                                   AS total_reviews,
        COUNT(*) OVER ()::int                                       AS total_count
      FROM pet_sitters ps
      LEFT JOIN pet_sitter_reviews r ON r."petSitterId" = ps.id
      WHERE ps."deletedAt" IS NULL
        AND ps.geog IS NOT NULL
        AND ST_DWithin(
          ps.geog::geography,
          ST_SetSRID(ST_MakePoint(${params.lng}::float8, ${params.lat}::float8), 4326)::geography,
          ${radiusMeters}::float8
        )
        ${servicesFilter}
        ${textFilter}
      GROUP BY
        ps.id, ps."fullName", ps."avatarUrl", ps.bio, ps.services,
        ps."baseCity", ps."baseState", ps.geog
      ORDER BY distance_km ASC
      LIMIT ${params.limit} OFFSET ${offset}
    `;

    const totalCount = rows.length > 0 ? Number(rows[0]!.total_count) : 0;
    return { rows, totalCount };
  }

  async findProfileBySlug(slug: string): Promise<RawPetSitterProfile | null> {
    if (slug.length < 9) return null;
    const idPrefix = slug.slice(-8) + '%';

    const rows = await this.prisma.$queryRaw<RawPetSitterProfile[]>`
      SELECT
        ps.id::text                                   AS id,
        ps."fullName"                                 AS full_name,
        ps."avatarUrl"                                AS avatar_url,
        ps.bio,
        ps.services,
        ps."baseCity"                                 AS base_city,
        ps."baseState"                                AS base_state,
        COALESCE(AVG(r.rating), 0)::float8            AS average_rating,
        COUNT(DISTINCT r.id)::int                     AS total_reviews
      FROM pet_sitters ps
      JOIN users u        ON u.id = ps."userId" AND u.status = 'active'
      LEFT JOIN pet_sitter_reviews r ON r."petSitterId" = ps.id
      WHERE ps.id::text LIKE ${idPrefix}
        AND ps."deletedAt" IS NULL
      GROUP BY
        ps.id, ps."fullName", ps."avatarUrl", ps.bio, ps.services,
        ps."baseCity", ps."baseState"
      LIMIT 1
    `;

    return rows[0] ?? null;
  }

  findByUserId(userId: string) {
    return this.prisma.petSitter.findUnique({ where: { userId } });
  }

  findWithUser(id: string) {
    return this.prisma.petSitter.findUnique({
      where: { id },
      include: { user: { include: { profile: true } } },
    });
  }

  async findFlaggedPaginated(page: number, limit: number) {
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.petSitter.findMany({
        where: { moderationStatus: 'flagged' },
        orderBy: { updatedAt: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.petSitter.count({ where: { moderationStatus: 'flagged' } }),
    ]);
    return { rows, total };
  }

  async findReviewedPaginated(page: number, limit: number) {
    const where: Prisma.PetSitterWhereInput = {
      moderationStatus: { in: ['confirmed_violation', 'dismissed'] },
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.petSitter.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.petSitter.count({ where }),
    ]);
    return { rows, total };
  }

  /** Marks a flagged profile as a confirmed violation and increments the
   * reincidência counter — the caller decides whether the new count warrants
   * escalation (e.g. auto-suspension) since that's a policy decision, not
   * persistence. */
  confirmViolation(id: string, moderatorNote?: string) {
    return this.prisma.petSitter.update({
      where: { id },
      data: {
        moderationStatus: 'confirmed_violation',
        violationCount: { increment: 1 },
        ...(moderatorNote !== undefined ? { moderatorNote } : {}),
      },
    });
  }

  async dismissFlag(id: string, moderatorNote?: string): Promise<void> {
    await this.prisma.petSitter.update({
      where: { id },
      data: {
        moderationStatus: 'dismissed',
        ...(moderatorNote !== undefined ? { moderatorNote } : {}),
      },
    });
  }

  async updateOwnProfile(
    userId: string,
    data: Prisma.PetSitterUpdateInput,
    geoPoint?: { lat: number; lng: number },
  ) {
    const updated = await this.prisma.petSitter.update({ where: { userId }, data });

    if (geoPoint) {
      await this.prisma.$executeRaw`
        UPDATE pet_sitters
        SET geog = ST_SetSRID(ST_MakePoint(${geoPoint.lng}::float8, ${geoPoint.lat}::float8), 4326)::geography
        WHERE "userId" = ${userId}::uuid
      `;
    }

    return updated;
  }
}
