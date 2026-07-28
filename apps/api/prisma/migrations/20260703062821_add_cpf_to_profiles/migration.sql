-- DropIndex
DROP INDEX "addresses_geog_idx";

-- DropIndex
DROP INDEX "addresses_serviceArea_idx";

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "cpf" TEXT;

-- RenameForeignKey
ALTER TABLE "availability_slots" RENAME CONSTRAINT "slots_veterinarianId_fkey" TO "availability_slots_veterinarianId_fkey";

-- RenameForeignKey
ALTER TABLE "veterinarian_specialties" RENAME CONSTRAINT "vet_specialties_specialtyId_fkey" TO "veterinarian_specialties_specialtyId_fkey";

-- RenameForeignKey
ALTER TABLE "veterinarian_specialties" RENAME CONSTRAINT "vet_specialties_vetId_fkey" TO "veterinarian_specialties_veterinarianId_fkey";

-- RenameIndex
ALTER INDEX "appointments_tutor_status_idx" RENAME TO "appointments_tutorId_status_idx";

-- RenameIndex
ALTER INDEX "appointments_vet_status_idx" RENAME TO "appointments_veterinarianId_status_idx";

-- RenameIndex
ALTER INDEX "slots_vetId_startsAt_idx" RENAME TO "availability_slots_veterinarianId_startsAt_idx";

-- RenameIndex
ALTER INDEX "notifications_userId_read_idx" RENAME TO "notifications_userId_readAt_idx";

-- RenameIndex
ALTER INDEX "refresh_tokens_hash_key" RENAME TO "refresh_tokens_tokenHash_key";

-- RenameIndex
ALTER INDEX "subscriptions_vetId_key" RENAME TO "subscriptions_veterinarianId_key";

-- RenameIndex
ALTER INDEX "veterinarians_verStatus_idx" RENAME TO "veterinarians_verificationStatus_idx";
