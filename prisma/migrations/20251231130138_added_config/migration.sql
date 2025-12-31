/*
  Warnings:

  - You are about to drop the column `isArchived` on the `Project` table. All the data in the column will be lost.
  - Made the column `isIndexed` on table `Url` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Project_isArchived_idx";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "isArchived";

-- AlterTable
ALTER TABLE "Url" ALTER COLUMN "isIndexed" SET NOT NULL,
ALTER COLUMN "isIndexed" SET DEFAULT false;

-- CreateTable
CREATE TABLE "domain_check_config" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "maxChecks" INTEGER NOT NULL DEFAULT 20,
    "indexedStopThreshold" INTEGER NOT NULL DEFAULT 2,
    "applyBlacklistRule" BOOLEAN NOT NULL DEFAULT true,
    "applyWhitelistRule" BOOLEAN NOT NULL DEFAULT true,
    "apiKey" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "domain_check_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "domain_check_config_apiKey_key" ON "domain_check_config"("apiKey");
