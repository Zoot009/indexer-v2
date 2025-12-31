-- CreateEnum
CREATE TYPE "CreditOperation" AS ENUM ('RESERVATION', 'RELEASE', 'CONSUMPTION', 'REFUND', 'ADJUSTMENT');

-- AlterEnum
ALTER TYPE "ProjectStatus" ADD VALUE 'PAUSED';

-- AlterEnum
ALTER TYPE "UrlStatus" ADD VALUE 'QUEUED';

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "creditsReserved" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "creditsUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "errorCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "indexedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "notIndexedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "processedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "totalUrls" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Url" ADD COLUMN     "checkedAt" TIMESTAMP(3),
ADD COLUMN     "errorMessage" TEXT;

-- CreateTable
CREATE TABLE "credit_config" (
    "id" TEXT NOT NULL,
    "totalCredits" INTEGER NOT NULL DEFAULT 1250000,
    "usedCredits" INTEGER NOT NULL DEFAULT 0,
    "reservedCredits" INTEGER NOT NULL DEFAULT 0,
    "creditsPerCheck" INTEGER NOT NULL DEFAULT 10,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_logs" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "operation" "CreditOperation" NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "description" TEXT,
    "projectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "credit_logs_projectId_idx" ON "credit_logs"("projectId");

-- CreateIndex
CREATE INDEX "credit_logs_createdAt_idx" ON "credit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Url_taskId_idx" ON "Url"("taskId");

-- CreateIndex
CREATE INDEX "Url_projectId_status_idx" ON "Url"("projectId", "status");

-- AddForeignKey
ALTER TABLE "credit_logs" ADD CONSTRAINT "credit_logs_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
