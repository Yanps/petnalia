-- Hand-written (prisma migrate dev refuses to run in this non-interactive
-- sandbox). Applied directly via psql, then registered with
-- `prisma migrate resolve --applied`.

CREATE TYPE "PetSitterBookingStatus" AS ENUM ('requested', 'confirmed', 'completed', 'cancelled');

CREATE TABLE "pet_sitter_availability_slots" (
    "id"          UUID         NOT NULL DEFAULT gen_random_uuid(),
    "petSitterId" UUID         NOT NULL,
    "startsAt"    TIMESTAMPTZ  NOT NULL,
    "endsAt"      TIMESTAMPTZ  NOT NULL,
    "status"      "SlotStatus" NOT NULL DEFAULT 'open',
    "heldUntil"   TIMESTAMPTZ,
    "createdAt"   TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMPTZ  NOT NULL,

    CONSTRAINT "pet_sitter_availability_slots_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "pet_sitter_bookings" (
    "id"          UUID                     NOT NULL DEFAULT gen_random_uuid(),
    "tutorId"     UUID                     NOT NULL,
    "petSitterId" UUID                     NOT NULL,
    "petId"       UUID                     NOT NULL,
    "addressId"   UUID,
    "slotId"      UUID                     NOT NULL,
    "service"     TEXT                     NOT NULL,
    "status"      "PetSitterBookingStatus" NOT NULL DEFAULT 'requested',
    "notes"       TEXT,
    "createdAt"   TIMESTAMPTZ              NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMPTZ              NOT NULL,
    "deletedAt"   TIMESTAMPTZ,

    CONSTRAINT "pet_sitter_bookings_pkey" PRIMARY KEY ("id")
);

CREATE INDEX        "pet_sitter_slots_sitterId_startsAt_idx" ON "pet_sitter_availability_slots"("petSitterId", "startsAt");

CREATE UNIQUE INDEX "pet_sitter_bookings_slotId_key"        ON "pet_sitter_bookings"("slotId");
CREATE INDEX        "pet_sitter_bookings_sitter_status_idx" ON "pet_sitter_bookings"("petSitterId", "status");
CREATE INDEX        "pet_sitter_bookings_tutor_status_idx"  ON "pet_sitter_bookings"("tutorId", "status");

ALTER TABLE "pet_sitter_availability_slots"
    ADD CONSTRAINT "pet_sitter_availability_slots_petSitterId_fkey"
    FOREIGN KEY ("petSitterId") REFERENCES "pet_sitters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "pet_sitter_bookings"
    ADD CONSTRAINT "pet_sitter_bookings_tutorId_fkey"
    FOREIGN KEY ("tutorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "pet_sitter_bookings"
    ADD CONSTRAINT "pet_sitter_bookings_petSitterId_fkey"
    FOREIGN KEY ("petSitterId") REFERENCES "pet_sitters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "pet_sitter_bookings"
    ADD CONSTRAINT "pet_sitter_bookings_petId_fkey"
    FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "pet_sitter_bookings"
    ADD CONSTRAINT "pet_sitter_bookings_addressId_fkey"
    FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "pet_sitter_bookings"
    ADD CONSTRAINT "pet_sitter_bookings_slotId_fkey"
    FOREIGN KEY ("slotId") REFERENCES "pet_sitter_availability_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
