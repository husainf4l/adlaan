/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `companies` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."companies" ADD COLUMN     "addressEn" TEXT,
ADD COLUMN     "commercialRegister" TEXT,
ADD COLUMN     "nameEn" TEXT,
ADD COLUMN     "taxNumber" TEXT;

-- CreateTable
CREATE TABLE "public"."document_layouts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "headerTemplate" TEXT NOT NULL,
    "footerTemplate" TEXT NOT NULL,
    "margins" JSONB NOT NULL,
    "fontSize" INTEGER NOT NULL DEFAULT 14,
    "fontFamily" TEXT NOT NULL DEFAULT 'Arial, sans-serif',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_layouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_email_key" ON "public"."companies"("email");

-- AddForeignKey
ALTER TABLE "public"."document_layouts" ADD CONSTRAINT "document_layouts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
