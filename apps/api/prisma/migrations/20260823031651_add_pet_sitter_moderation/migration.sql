-- Hand-written (prisma migrate dev refuses to run in this non-interactive
-- sandbox). Applied directly via psql, then registered with
-- `prisma migrate resolve --applied`.

CREATE TYPE "PetSitterModerationStatus" AS ENUM ('clean', 'flagged', 'confirmed_violation', 'dismissed');

ALTER TABLE "pet_sitters"
  ADD COLUMN "moderationStatus" "PetSitterModerationStatus" NOT NULL DEFAULT 'clean',
  ADD COLUMN "flagReason" TEXT,
  ADD COLUMN "moderatorNote" TEXT;

CREATE INDEX "pet_sitters_moderationStatus_idx" ON "pet_sitters"("moderationStatus");
