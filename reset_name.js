
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.settings.update({
      where: { id: 1 },
      data: { 
        companyName: 'FieldSync Pro',
        smsNotifications: false // Resetting this too as it was changed in test
      }
    });
    console.log('Successfully reset database record to FieldSync Pro.');
  } catch (e) {
    console.error('Error resetting database:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
