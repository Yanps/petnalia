-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN "providerSubscriptionId" TEXT,
                            ADD COLUMN "priceCents" INTEGER NOT NULL DEFAULT 0;
