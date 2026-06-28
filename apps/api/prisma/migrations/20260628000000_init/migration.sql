-- Migration: 20260628000000_init
-- Hand-edited after `prisma migrate dev --create-only` to add:
--   1. PostGIS/pgcrypto/citext extension bootstrap
--   2. geography(Point/Polygon) columns (Unsupported in Prisma schema)
--   3. GIST indexes on geography columns
-- See ARCHITECTURE.md §10 and ADR-002.

-- ── Extensions ────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

-- ── Enums ─────────────────────────────────────────────────────────────────────

CREATE TYPE "Role" AS ENUM ('tutor', 'veterinarian', 'admin');
CREATE TYPE "UserStatus" AS ENUM ('active', 'suspended', 'deleted');
CREATE TYPE "PetSex" AS ENUM ('male', 'female');
CREATE TYPE "VerificationStatus" AS ENUM ('pending', 'in_review', 'verified', 'rejected');
CREATE TYPE "VetTier" AS ENUM ('free', 'premium');
CREATE TYPE "AppointmentStatus" AS ENUM ('requested', 'confirmed', 'pending', 'completed', 'cancelled');
CREATE TYPE "Modality" AS ENUM ('home', 'online');
CREATE TYPE "SlotStatus" AS ENUM ('open', 'held', 'booked', 'blocked');
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'past_due', 'cancelled', 'trialing');
CREATE TYPE "NotificationChannel" AS ENUM ('email', 'whatsapp', 'push');

-- ── Tables ────────────────────────────────────────────────────────────────────

-- CreateTable users
CREATE TABLE "users" (
    "id"              UUID        NOT NULL DEFAULT gen_random_uuid(),
    "email"           CITEXT      NOT NULL,
    "passwordHash"    TEXT        NOT NULL,
    "role"            "Role"      NOT NULL,
    "emailVerifiedAt" TIMESTAMPTZ,
    "status"          "UserStatus" NOT NULL DEFAULT 'active',
    "createdAt"       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMPTZ NOT NULL,
    "deletedAt"       TIMESTAMPTZ,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable profiles
CREATE TABLE "profiles" (
    "id"        UUID        NOT NULL DEFAULT gen_random_uuid(),
    "userId"    UUID        NOT NULL,
    "fullName"  TEXT        NOT NULL,
    "phone"     TEXT,
    "avatarUrl" TEXT,
    "locale"    TEXT        NOT NULL DEFAULT 'pt-BR',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable pets
CREATE TABLE "pets" (
    "id"        UUID         NOT NULL DEFAULT gen_random_uuid(),
    "ownerId"   UUID         NOT NULL,
    "name"      TEXT         NOT NULL,
    "species"   TEXT         NOT NULL,
    "breed"     TEXT,
    "birthdate" DATE,
    "weightKg"  DECIMAL(5,2),
    "sex"       "PetSex"     NOT NULL,
    "neutered"  BOOLEAN      NOT NULL DEFAULT false,
    "microchip" TEXT,
    "photoUrl"  TEXT,
    "createdAt" TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ  NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "pets_pkey" PRIMARY KEY ("id")
);

-- CreateTable veterinarians
CREATE TABLE "veterinarians" (
    "id"                 UUID                  NOT NULL DEFAULT gen_random_uuid(),
    "userId"             UUID                  NOT NULL,
    "crmv"               TEXT                  NOT NULL,
    "crmvState"          CHAR(2)               NOT NULL,
    "bio"                TEXT,
    "verificationStatus" "VerificationStatus"  NOT NULL DEFAULT 'pending',
    "tier"               "VetTier"             NOT NULL DEFAULT 'free',
    "serviceRadiusKm"    INTEGER               NOT NULL DEFAULT 20,
    "createdAt"          TIMESTAMPTZ           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"          TIMESTAMPTZ           NOT NULL,
    "deletedAt"          TIMESTAMPTZ,

    CONSTRAINT "veterinarians_pkey" PRIMARY KEY ("id")
);

-- CreateTable specialties
CREATE TABLE "specialties" (
    "id"   UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "specialties_pkey" PRIMARY KEY ("id")
);

-- CreateTable veterinarian_specialties (join table)
CREATE TABLE "veterinarian_specialties" (
    "veterinarianId" UUID NOT NULL,
    "specialtyId"    UUID NOT NULL,

    CONSTRAINT "veterinarian_specialties_pkey" PRIMARY KEY ("veterinarianId", "specialtyId")
);

-- CreateTable addresses
-- geog and serviceArea are geography types (PostGIS); hand-edited from Unsupported().
CREATE TABLE "addresses" (
    "id"              UUID        NOT NULL DEFAULT gen_random_uuid(),
    "userId"          UUID        NOT NULL,
    "label"           TEXT,
    "street"          TEXT        NOT NULL,
    "number"          TEXT        NOT NULL,
    "complement"      TEXT,
    "neighborhood"    TEXT        NOT NULL,
    "city"            TEXT        NOT NULL,
    "state"           CHAR(2)     NOT NULL,
    "cep"             TEXT        NOT NULL,
    "geog"            geography(Point, 4326),
    "serviceRadiusKm" INTEGER,
    "serviceArea"     geography(Polygon, 4326),
    "createdAt"       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMPTZ NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable availability_slots
CREATE TABLE "availability_slots" (
    "id"             UUID         NOT NULL DEFAULT gen_random_uuid(),
    "veterinarianId" UUID         NOT NULL,
    "startsAt"       TIMESTAMPTZ  NOT NULL,
    "endsAt"         TIMESTAMPTZ  NOT NULL,
    "status"         "SlotStatus" NOT NULL DEFAULT 'open',
    "recurrenceId"   UUID,
    "createdAt"      TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMPTZ  NOT NULL,

    CONSTRAINT "availability_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable appointments
CREATE TABLE "appointments" (
    "id"             UUID                 NOT NULL DEFAULT gen_random_uuid(),
    "tutorId"        UUID                 NOT NULL,
    "veterinarianId" UUID                 NOT NULL,
    "petId"          UUID                 NOT NULL,
    "addressId"      UUID                 NOT NULL,
    "slotId"         UUID                 NOT NULL,
    "modality"       "Modality"           NOT NULL,
    "status"         "AppointmentStatus"  NOT NULL DEFAULT 'requested',
    "priceCents"     INTEGER              NOT NULL,
    "notes"          TEXT,
    "createdAt"      TIMESTAMPTZ          NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMPTZ          NOT NULL,
    "deletedAt"      TIMESTAMPTZ,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable reviews
CREATE TABLE "reviews" (
    "id"             UUID        NOT NULL DEFAULT gen_random_uuid(),
    "appointmentId"  UUID        NOT NULL,
    "authorId"       UUID        NOT NULL,
    "veterinarianId" UUID        NOT NULL,
    "rating"         INTEGER     NOT NULL,
    "text"           TEXT,
    "publishedAt"    TIMESTAMPTZ,
    "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMPTZ NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable subscriptions
CREATE TABLE "subscriptions" (
    "id"                 UUID                  NOT NULL DEFAULT gen_random_uuid(),
    "veterinarianId"     UUID                  NOT NULL,
    "plan"               TEXT                  NOT NULL,
    "status"             "SubscriptionStatus"  NOT NULL,
    "provider"           TEXT                  NOT NULL DEFAULT 'stripe',
    "providerCustomerId" TEXT,
    "currentPeriodEnd"   TIMESTAMPTZ,
    "cancelAtPeriodEnd"  BOOLEAN               NOT NULL DEFAULT false,
    "createdAt"          TIMESTAMPTZ           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"          TIMESTAMPTZ           NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable notifications
CREATE TABLE "notifications" (
    "id"        UUID                  NOT NULL DEFAULT gen_random_uuid(),
    "userId"    UUID                  NOT NULL,
    "type"      TEXT                  NOT NULL,
    "channel"   "NotificationChannel" NOT NULL,
    "payload"   JSONB                 NOT NULL,
    "readAt"    TIMESTAMPTZ,
    "sentAt"    TIMESTAMPTZ,
    "status"    TEXT                  NOT NULL,
    "createdAt" TIMESTAMPTZ           NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable refresh_tokens
CREATE TABLE "refresh_tokens" (
    "id"        UUID        NOT NULL DEFAULT gen_random_uuid(),
    "userId"    UUID        NOT NULL,
    "tokenHash" TEXT        NOT NULL,
    "deviceId"  TEXT,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    "revokedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE UNIQUE INDEX "users_email_key"              ON "users"("email");
CREATE INDEX        "users_role_idx"               ON "users"("role");

CREATE UNIQUE INDEX "profiles_userId_key"          ON "profiles"("userId");

CREATE INDEX        "pets_ownerId_idx"             ON "pets"("ownerId");

CREATE UNIQUE INDEX "veterinarians_userId_key"     ON "veterinarians"("userId");
CREATE INDEX        "veterinarians_verStatus_idx"  ON "veterinarians"("verificationStatus");
CREATE INDEX        "veterinarians_tier_idx"       ON "veterinarians"("tier");

CREATE UNIQUE INDEX "specialties_slug_key"         ON "specialties"("slug");

CREATE INDEX        "addresses_userId_idx"         ON "addresses"("userId");
-- GIST indexes for PostGIS — must use USING GIST on geography columns
CREATE INDEX        "addresses_geog_idx"           ON "addresses" USING GIST ("geog");
CREATE INDEX        "addresses_serviceArea_idx"    ON "addresses" USING GIST ("serviceArea");

CREATE INDEX        "slots_vetId_startsAt_idx"     ON "availability_slots"("veterinarianId", "startsAt");

CREATE UNIQUE INDEX "appointments_slotId_key"      ON "appointments"("slotId");
CREATE INDEX        "appointments_vet_status_idx"  ON "appointments"("veterinarianId", "status");
CREATE INDEX        "appointments_tutor_status_idx" ON "appointments"("tutorId", "status");

CREATE UNIQUE INDEX "reviews_appointmentId_key"    ON "reviews"("appointmentId");
CREATE INDEX        "reviews_veterinarianId_idx"   ON "reviews"("veterinarianId");

CREATE UNIQUE INDEX "subscriptions_vetId_key"      ON "subscriptions"("veterinarianId");
CREATE INDEX        "subscriptions_status_idx"     ON "subscriptions"("status");

CREATE INDEX        "notifications_userId_read_idx" ON "notifications"("userId", "readAt");

CREATE UNIQUE INDEX "refresh_tokens_hash_key"      ON "refresh_tokens"("tokenHash");
CREATE INDEX        "refresh_tokens_userId_idx"    ON "refresh_tokens"("userId");

-- ── Foreign Keys ──────────────────────────────────────────────────────────────

ALTER TABLE "profiles"
    ADD CONSTRAINT "profiles_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "pets"
    ADD CONSTRAINT "pets_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "veterinarians"
    ADD CONSTRAINT "veterinarians_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "veterinarian_specialties"
    ADD CONSTRAINT "vet_specialties_vetId_fkey"
    FOREIGN KEY ("veterinarianId") REFERENCES "veterinarians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "veterinarian_specialties"
    ADD CONSTRAINT "vet_specialties_specialtyId_fkey"
    FOREIGN KEY ("specialtyId") REFERENCES "specialties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "addresses"
    ADD CONSTRAINT "addresses_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "availability_slots"
    ADD CONSTRAINT "slots_veterinarianId_fkey"
    FOREIGN KEY ("veterinarianId") REFERENCES "veterinarians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "appointments"
    ADD CONSTRAINT "appointments_tutorId_fkey"
    FOREIGN KEY ("tutorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "appointments"
    ADD CONSTRAINT "appointments_veterinarianId_fkey"
    FOREIGN KEY ("veterinarianId") REFERENCES "veterinarians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "appointments"
    ADD CONSTRAINT "appointments_petId_fkey"
    FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "appointments"
    ADD CONSTRAINT "appointments_addressId_fkey"
    FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "appointments"
    ADD CONSTRAINT "appointments_slotId_fkey"
    FOREIGN KEY ("slotId") REFERENCES "availability_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "reviews"
    ADD CONSTRAINT "reviews_appointmentId_fkey"
    FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "reviews"
    ADD CONSTRAINT "reviews_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "reviews"
    ADD CONSTRAINT "reviews_veterinarianId_fkey"
    FOREIGN KEY ("veterinarianId") REFERENCES "veterinarians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "subscriptions"
    ADD CONSTRAINT "subscriptions_veterinarianId_fkey"
    FOREIGN KEY ("veterinarianId") REFERENCES "veterinarians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "notifications"
    ADD CONSTRAINT "notifications_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "refresh_tokens"
    ADD CONSTRAINT "refresh_tokens_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
