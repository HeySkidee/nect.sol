-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'SOFTWARE', 'ARCHIVE', 'OTHER');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'PRIVATE', 'UNLISTED');

-- CreateEnum
CREATE TYPE "UploadType" AS ENUM ('CENTRALIZED', 'DECENTRALIZED');

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "isUnlimitedStock" BOOLEAN NOT NULL DEFAULT true,
    "stockQuantity" INTEGER,
    "category" "ProductCategory" NOT NULL,
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "oneTimeDownload" BOOLEAN NOT NULL DEFAULT true,
    "uploadType" "UploadType" NOT NULL DEFAULT 'CENTRALIZED',
    "creatorId" TEXT NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
