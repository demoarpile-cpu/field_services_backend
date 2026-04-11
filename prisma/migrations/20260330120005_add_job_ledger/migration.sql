-- CreateTable
CREATE TABLE `JobLedger` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `jobId` INTEGER NOT NULL,
    `type` ENUM('CREDIT', 'DEBIT') NOT NULL,
    `category` ENUM('DEPOSIT', 'MATERIAL', 'LABOR', 'PERMIT', 'SUBCONTRACTOR', 'EQUIPMENT', 'MISC') NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `paymentMethod` ENUM('CASH', 'CHECK', 'CARD', 'BANK_TRANSFER', 'ONLINE', 'ZELLE', 'VENMO') NULL,
    `referenceNumber` VARCHAR(191) NULL,
    `note` TEXT NULL,
    `createdById` INTEGER NOT NULL,
    `transactionDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `JobLedger_jobId_idx`(`jobId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `JobLedger` ADD CONSTRAINT `JobLedger_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `Job`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobLedger` ADD CONSTRAINT `JobLedger_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
