const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createReviewTable() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`review\` (
          \`id\` INT NOT NULL AUTO_INCREMENT,
          \`customerId\` INT NOT NULL,
          \`jobId\` INT,
          \`rating\` INT NOT NULL,
          \`comment\` TEXT NOT NULL,
          \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
          PRIMARY KEY (\`id\`),
          INDEX \`review_customerId_idx\` (\`customerId\`),
          INDEX \`review_jobId_idx\` (\`jobId\`),
          CONSTRAINT \`review_customerId_fkey\` FOREIGN KEY (\`customerId\`) REFERENCES \`customer\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE,
          CONSTRAINT \`review_jobId_fkey\` FOREIGN KEY (\`jobId\`) REFERENCES \`job\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);
    console.log("Review table created successfully.");
  } catch (err) {
    console.error("Error creating table:", err);
  } finally {
    await prisma.$disconnect();
  }
}
createReviewTable();
