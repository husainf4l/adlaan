-- CreateEnum
CREATE TYPE "public"."DocumentItemType" AS ENUM ('FILE', 'FOLDER');

-- CreateEnum
CREATE TYPE "public"."DocumentType" AS ENUM ('CONTRACT', 'INVOICE', 'PROPOSAL', 'REPORT', 'PRESENTATION', 'SPREADSHEET', 'IMAGE', 'PDF', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."DocumentPermissionRole" AS ENUM ('OWNER', 'EDITOR', 'VIEWER');

-- CreateTable
CREATE TABLE "public"."document_items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."DocumentItemType" NOT NULL,
    "parentId" TEXT,
    "size" BIGINT,
    "mimeType" TEXT,
    "extension" TEXT,
    "checksum" TEXT,
    "version" INTEGER DEFAULT 1,
    "isLocked" BOOLEAN DEFAULT false,
    "downloadUrl" TEXT,
    "previewUrl" TEXT,
    "thumbnailUrl" TEXT,
    "color" TEXT,
    "description" TEXT,
    "path" TEXT NOT NULL,
    "documentType" "public"."DocumentType" DEFAULT 'OTHER',
    "isStarred" BOOLEAN NOT NULL DEFAULT false,
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "createdById" TEXT NOT NULL,
    "lastModifiedById" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."document_permissions" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "public"."DocumentPermissionRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."document_versions" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "size" BIGINT NOT NULL,
    "checksum" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "comment" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "document_permissions_itemId_userId_key" ON "public"."document_permissions"("itemId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "document_versions_itemId_version_key" ON "public"."document_versions"("itemId", "version");

-- AddForeignKey
ALTER TABLE "public"."document_items" ADD CONSTRAINT "document_items_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."document_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_items" ADD CONSTRAINT "document_items_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_items" ADD CONSTRAINT "document_items_lastModifiedById_fkey" FOREIGN KEY ("lastModifiedById") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_items" ADD CONSTRAINT "document_items_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_permissions" ADD CONSTRAINT "document_permissions_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."document_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_permissions" ADD CONSTRAINT "document_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_versions" ADD CONSTRAINT "document_versions_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."document_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_versions" ADD CONSTRAINT "document_versions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
