-- AlterTable
ALTER TABLE "veterinarians" ADD COLUMN     "homePriceCents" INTEGER,
ADD COLUMN     "onlinePriceCents" INTEGER;

-- AlterTable
ALTER TABLE "appointments" ALTER COLUMN "priceCents" DROP NOT NULL;


-- Custom SQL (VETS-01) — constraints Prisma cannot express.
-- A published price is 1..1_000_000 cents (R$ 0,01 .. R$ 10.000,00); NULL = "a combinar".
ALTER TABLE "veterinarians"
  ADD CONSTRAINT "veterinarians_homePriceCents_check"
    CHECK ("homePriceCents" IS NULL OR "homePriceCents" BETWEEN 1 AND 1000000),
  ADD CONSTRAINT "veterinarians_onlinePriceCents_check"
    CHECK ("onlinePriceCents" IS NULL OR "onlinePriceCents" BETWEEN 1 AND 1000000);

-- Until now every appointment was booked with a hardcoded 0 placeholder,
-- never a price the vet chose: those become "a combinar".
UPDATE "appointments" SET "priceCents" = NULL WHERE "priceCents" = 0;

ALTER TABLE "appointments"
  ADD CONSTRAINT "appointments_priceCents_check"
    CHECK ("priceCents" IS NULL OR "priceCents" BETWEEN 1 AND 1000000);
