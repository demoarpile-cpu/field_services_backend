require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Adding GPS fields to job table...");
    await prisma.$executeRawUnsafe(`
      ALTER TABLE job 
      ADD COLUMN lastLatitude FLOAT,
      ADD COLUMN lastLongitude FLOAT,
      ADD COLUMN lastLocationUpdate DATETIME(3)
    `);
    console.log("GPS columns added successfully to job.");
  } catch (err) {
    if (err.message.includes('Duplicate column name')) {
      console.log('Columns already exist - safe to proceed.');
    } else {
      console.error("Error adding columns:", err);
    }
  } finally {
    await prisma.$disconnect();
  }
}
main();
