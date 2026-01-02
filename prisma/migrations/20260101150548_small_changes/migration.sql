/*
  Warnings:

  - You are about to drop the column `creditsReserved` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the `urls` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "urls" DROP CONSTRAINT "urls_domainId_fkey";

-- DropForeignKey
ALTER TABLE "urls" DROP CONSTRAINT "urls_projectId_fkey";

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "creditsReserved";

-- DropTable
DROP TABLE "urls";

-- CreateTable
CREATE TABLE "url" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "isIndexed" BOOLEAN NOT NULL DEFAULT false,
    "anchorText" TEXT,
    "checkCount" INTEGER NOT NULL DEFAULT 0,
    "status" "UrlStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "checkedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "projectId" TEXT NOT NULL,
    "domainId" TEXT,

    CONSTRAINT "url_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "url_url_key" ON "url"("url");

-- CreateIndex
CREATE INDEX "url_status_idx" ON "url"("status");

-- CreateIndex
CREATE INDEX "url_isIndexed_idx" ON "url"("isIndexed");

-- CreateIndex
CREATE INDEX "url_projectId_status_idx" ON "url"("projectId", "status");

-- AddForeignKey
ALTER TABLE "url" ADD CONSTRAINT "url_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "url" ADD CONSTRAINT "url_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domains"("id") ON DELETE SET NULL ON UPDATE CASCADE;
