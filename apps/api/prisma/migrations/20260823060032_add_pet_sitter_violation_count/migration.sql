-- Hand-written (prisma migrate dev refuses to run in this non-interactive
-- sandbox). Applied directly via psql, then registered with
-- `prisma migrate resolve --applied`.

ALTER TABLE "pet_sitters"
  ADD COLUMN "violationCount" INTEGER NOT NULL DEFAULT 0;
