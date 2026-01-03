/*
  Warnings:

  - You are about to drop the column `blacklistedAt` on the `domains` table. All the data in the column will be lost.
  - You are about to drop the column `indexedUrlsCount` on the `domains` table. All the data in the column will be lost.
  - You are about to drop the column `isBlacklisted` on the `domains` table. All the data in the column will be lost.
  - You are about to drop the column `isWhitelisted` on the `domains` table. All the data in the column will be lost.
  - You are about to drop the column `notIndexedCount` on the `domains` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `domains` table. All the data in the column will be lost.
  - You are about to drop the column `totalUrlsChecked` on the `domains` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "domains" DROP CONSTRAINT "domains_projectId_fkey";

-- DropIndex
DROP INDEX "domains_isBlacklisted_idx";

-- AlterTable
ALTER TABLE "domains" DROP COLUMN "blacklistedAt",
DROP COLUMN "indexedUrlsCount",
DROP COLUMN "isBlacklisted",
DROP COLUMN "isWhitelisted",
DROP COLUMN "notIndexedCount",
DROP COLUMN "projectId",
DROP COLUMN "totalUrlsChecked";

-- CreateTable
CREATE TABLE "project_domains" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "notIndexedCount" INTEGER NOT NULL DEFAULT 0,
    "totalUrlsChecked" INTEGER NOT NULL DEFAULT 0,
    "indexedUrlsCount" INTEGER NOT NULL DEFAULT 0,
    "isBlacklisted" BOOLEAN NOT NULL DEFAULT false,
    "isWhitelisted" BOOLEAN NOT NULL DEFAULT false,
    "blacklistedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_domains_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_domains_isBlacklisted_idx" ON "project_domains"("isBlacklisted");

-- CreateIndex
CREATE UNIQUE INDEX "project_domains_projectId_domainId_key" ON "project_domains"("projectId", "domainId");

-- AddForeignKey
ALTER TABLE "project_domains" ADD CONSTRAINT "project_domains_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_domains" ADD CONSTRAINT "project_domains_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;
