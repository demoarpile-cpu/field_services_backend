const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testTeamMessages() {
  try {
    const messages = await prisma.teamMessage.findMany({
      take: 50,
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, name: true, role: true } }
      }
    });
    console.log('Messages retrieved:', messages.length);
  } catch (error) {
    console.error('Prisma Error Details:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTeamMessages();
