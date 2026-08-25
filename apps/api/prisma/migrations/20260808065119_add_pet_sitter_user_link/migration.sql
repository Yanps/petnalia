-- Hand-written (prisma migrate dev refuses to run in this non-interactive
-- sandbox). Applied directly via psql, then registered with
-- `prisma migrate resolve --applied`.

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'pet_sitter';

-- AlterTable: pet_sitters is empty in dev at this point (truncated before
-- this migration), so a NOT NULL column can be added directly.
ALTER TABLE "pet_sitters" ADD COLUMN "userId" UUID NOT NULL;
ALTER TABLE "pet_sitters" ALTER COLUMN "baseCity" DROP NOT NULL;
ALTER TABLE "pet_sitters" ALTER COLUMN "baseState" DROP NOT NULL;
ALTER TABLE "pet_sitters" ALTER COLUMN "services" SET DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "pet_sitters_userId_key" ON "pet_sitters"("userId");

-- AddForeignKey
ALTER TABLE "pet_sitters"
    ADD CONSTRAINT "pet_sitters_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
