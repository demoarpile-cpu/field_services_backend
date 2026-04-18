-- AlterTable
ALTER TABLE `estimate`
  ADD COLUMN `customerSignature` TEXT NULL,
  ADD COLUMN `approvedAt` DATETIME(3) NULL,
  ADD COLUMN `declinedAt` DATETIME(3) NULL;
