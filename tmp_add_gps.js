require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Adding GPS fields to employee table...");
    
    // Add columns manually to prevent Prisma Migration Drift issues!
    await prisma.$executeRawUnsafe(`
      ALTER TABLE employee 
      ADD COLUMN latitude FLOAT,
      ADD COLUMN longitude FLOAT,
      ADD COLUMN lastLocationUpdate DATETIME(3)
    `);
    
    console.log("GPS columns added successfully.");
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
