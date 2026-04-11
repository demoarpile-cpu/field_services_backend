const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding base data...');

  // 1. Financing Providers
  const providers = [
    { name: 'FieldSync Credit', type: 'Internal', active: true },
    { name: 'Affirm', type: 'External', active: true },
    { name: 'Synchrony', type: 'External', active: true }
  ];

  for (const p of providers) {
    await prisma.financingProvider.upsert({
      where: { id: 0 }, // Dummy where for upsert on name if unique, but let's use createMany or find/create
      update: {},
      create: p,
    }).catch(async (e) => {
       // Just create if ID 0 doesn't match
       await prisma.financingProvider.create({ data: p }).catch(() => {});
    });
  }

  // 2. Suppliers
  const suppliers = [
    { name: "Lowe's", type: "External", email: "support@lowes.com" },
    { name: "Home Depot", type: "External", email: "support@homedepot.com" },
    { name: "Internal Inventory", type: "Internal" }
  ];

  for (const s of suppliers) {
    await prisma.supplier.create({ data: s }).catch(() => {});
  }

  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
