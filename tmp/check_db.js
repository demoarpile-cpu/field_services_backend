const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMaterials() {
  const materials = await prisma.material.findMany();
  console.log('Materials in DB:', JSON.stringify(materials, null, 2));
  await prisma.$disconnect();
}

checkMaterials();
