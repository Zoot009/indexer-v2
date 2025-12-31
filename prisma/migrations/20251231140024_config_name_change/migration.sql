/*
  Warnings:

  - You are about to drop the `domain_check_config` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "domain_check_config";

-- CreateTable
CREATE TABLE "config" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "maxChecks" INTEGER NOT NULL DEFAULT 20,
    "indexedStopThreshold" INTEGER NOT NULL DEFAULT 2,
    "applyBlacklistRule" BOOLEAN NOT NULL DEFAULT true,
    "applyWhitelistRule" BOOLEAN NOT NULL DEFAULT true,
    "apiKey" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "config_apiKey_key" ON "config"("apiKey");
