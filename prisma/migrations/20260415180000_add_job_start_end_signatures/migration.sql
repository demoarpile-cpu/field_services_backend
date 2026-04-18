-- AlterTable
ALTER TABLE `job`
  ADD COLUMN `startSignature` TEXT NULL,
  ADD COLUMN `endSignature` TEXT NULL,
  ADD COLUMN `startSignedAt` DATETIME(3) NULL,
  ADD COLUMN `endSignedAt` DATETIME(3) NULL;
