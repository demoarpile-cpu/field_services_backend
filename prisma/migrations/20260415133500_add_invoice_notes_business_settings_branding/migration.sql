-- AlterTable
ALTER TABLE `invoice`
  ADD COLUMN `notes` TEXT NULL;

-- AlterTable
ALTER TABLE `settings`
  ADD COLUMN `businessName` VARCHAR(191) NULL,
  ADD COLUMN `logoUrl` VARCHAR(191) NULL,
  ADD COLUMN `businessPhone` VARCHAR(191) NULL,
  ADD COLUMN `businessContactEmail` VARCHAR(191) NULL,
  ADD COLUMN `businessAddress` TEXT NULL;
