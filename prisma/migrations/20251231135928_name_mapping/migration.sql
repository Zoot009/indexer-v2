/*
  Warnings:

  - You are about to drop the `Domain` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Url` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Domain" DROP CONSTRAINT "Domain_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Url" DROP CONSTRAINT "Url_domainId_fkey";

-- DropForeignKey
ALTER TABLE "Url" DROP CONSTRAINT "Url_projectId_fkey";

-- DropForeignKey
ALTER TABLE "credit_logs" DROP CONSTRAINT "credit_logs_projectId_fkey";

-- DropTable
DROP TABLE "Domain";

-- DropTable
DROP TABLE "Project";

-- DropTable
DROP TABLE "Url";

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'IDLE',
    "totalUrls" INTEGER NOT NULL DEFAULT 0,
    "processedCount" INTEGER NOT NULL DEFAULT 0,
    "indexedCount" INTEGER NOT NULL DEFAULT 0,
    "notIndexedCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "creditsReserved" INTEGER NOT NULL DEFAULT 0,
    "creditsUsed" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "urls" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "isIndexed" BOOLEAN NOT NULL DEFAULT false,
    "anchorText" TEXT,
    "checkCount" INTEGER NOT NULL DEFAULT 0,
    "status" "UrlStatus" NOT NULL DEFAULT 'PENDING',
    "htmlContent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "checkedAt" TIMESTAMP(3),
    "jobId" TEXT,
    "taskId" TEXT,
    "errorMessage" TEXT,
    "projectId" TEXT NOT NULL,
    "domainId" TEXT,

    CONSTRAINT "urls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "domains" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "notIndexedCount" INTEGER NOT NULL DEFAULT 0,
    "totalUrlsChecked" INTEGER NOT NULL DEFAULT 0,
    "indexedUrlsCount" INTEGER NOT NULL DEFAULT 0,
    "isBlacklisted" BOOLEAN NOT NULL DEFAULT false,
    "isWhitelisted" BOOLEAN NOT NULL DEFAULT false,
    "blacklistedAt" TIMESTAMP(3),
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "domains_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "projects_createdAt_idx" ON "projects"("createdAt");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE UNIQUE INDEX "urls_url_key" ON "urls"("url");

-- CreateIndex
CREATE INDEX "urls_domain_idx" ON "urls"("domain");

-- CreateIndex
CREATE INDEX "urls_status_idx" ON "urls"("status");

-- CreateIndex
CREATE INDEX "urls_isIndexed_idx" ON "urls"("isIndexed");

-- CreateIndex
CREATE INDEX "urls_taskId_idx" ON "urls"("taskId");

-- CreateIndex
CREATE INDEX "urls_projectId_status_idx" ON "urls"("projectId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "domains_domain_key" ON "domains"("domain");

-- CreateIndex
CREATE INDEX "domains_isBlacklisted_idx" ON "domains"("isBlacklisted");

-- CreateIndex
CREATE INDEX "domains_domain_idx" ON "domains"("domain");

-- AddForeignKey
ALTER TABLE "credit_logs" ADD CONSTRAINT "credit_logs_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "urls" ADD CONSTRAINT "urls_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "urls" ADD CONSTRAINT "urls_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domains"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "domains" ADD CONSTRAINT "domains_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
