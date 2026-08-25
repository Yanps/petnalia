-- Hand-edited after `prisma migrate dev --create-only` to add the GIST index
-- on the geography column — see ARCHITECTURE.md §10 and ADR-002.

-- CreateTable
CREATE TABLE "pet_sitters" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "fullName" TEXT NOT NULL,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "services" TEXT[],
    "baseCity" TEXT NOT NULL,
    "baseState" CHAR(2) NOT NULL,
    "geog" geography(Point, 4326),
    "deletedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "pet_sitters_pkey" PRIMARY KEY ("id")
);

-- GIST index for PostGIS — must use USING GIST on geography columns
CREATE INDEX "pet_sitters_geog_idx" ON "pet_sitters" USING GIST ("geog");
