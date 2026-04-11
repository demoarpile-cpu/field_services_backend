const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrate() {
  try {
    console.log('Starting migration...');
    
    // Add columns to the 'job' table
    await prisma.$executeRawUnsafe(`
      ALTER TABLE job 
      ADD COLUMN trackingActive BOOLEAN DEFAULT FALSE,
      ADD COLUMN trackingStartedAt DATETIME(3) NULL,
      ADD COLUMN trackingStoppedAt DATETIME(3) NULL;
    `);
    
    console.log('Migration successful: tracking fields added to job table.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
