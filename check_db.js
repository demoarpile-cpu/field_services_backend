
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const tables = await prisma.$queryRawUnsafe('SHOW TABLES');
    const tableList = tables.map(t => Object.values(t)[0]);
    console.log('Tables found:', tableList.join(', '));
    
    // Check missing tables specifically
    const missing = ['JobLedger', 'Lead', 'CalendarEvent'];
    for (const model of missing) {
      const lower = model.toLowerCase();
      const match = tableList.includes(model) || tableList.includes(lower);
      if (match) {
        const actualName = tableList.includes(model) ? model : lower;
        const count = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM \`${actualName}\``);
        console.log(`Model ${model} exists as ${actualName} with ${count[0].count} rows.`);
      } else {
        console.log(`Model ${model} (and ${lower}) NOT FOUND.`);
      }
    }
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
