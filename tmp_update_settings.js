const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateSettingsTable() {
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE \`settings\`
      ADD COLUMN \`facebookUrl\` VARCHAR(191) NULL,
      ADD COLUMN \`instagramUrl\` VARCHAR(191) NULL,
      ADD COLUMN \`websiteUrl\` VARCHAR(191) NULL;
    `);
    console.log("Settings columns added successfully.");
  } catch (err) {
    if (err.message.includes('Duplicate column name')) {
        console.log("Columns already exist, proceeding...");
    } else {
        console.error("Error updating table:", err.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}
updateSettingsTable();
