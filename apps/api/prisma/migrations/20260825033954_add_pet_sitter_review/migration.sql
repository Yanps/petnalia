CREATE TABLE "pet_sitter_reviews" (
    "id"          UUID        NOT NULL DEFAULT gen_random_uuid(),
    "bookingId"   UUID        NOT NULL,
    "authorId"    UUID        NOT NULL,
    "petSitterId" UUID        NOT NULL,
    "rating"      INTEGER     NOT NULL,
    "text"        TEXT,
    "publishedAt" TIMESTAMPTZ,
    "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMPTZ NOT NULL,

    CONSTRAINT "pet_sitter_reviews_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pet_sitter_reviews_bookingId_key" ON "pet_sitter_reviews"("bookingId");
CREATE INDEX        "pet_sitter_reviews_petSitterId_idx" ON "pet_sitter_reviews"("petSitterId");

ALTER TABLE "pet_sitter_reviews"
    ADD CONSTRAINT "pet_sitter_reviews_bookingId_fkey"
    FOREIGN KEY ("bookingId") REFERENCES "pet_sitter_bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "pet_sitter_reviews"
    ADD CONSTRAINT "pet_sitter_reviews_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "pet_sitter_reviews"
    ADD CONSTRAINT "pet_sitter_reviews_petSitterId_fkey"
    FOREIGN KEY ("petSitterId") REFERENCES "pet_sitters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
