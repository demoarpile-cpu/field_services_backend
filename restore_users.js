const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function restoreUsers() {
  console.log('Restoring 2 users...');
  
  try {
    const password = await bcrypt.hash('password123', 10);
    
    const users = [
      { email: 'tech@fieldsync.com', name: 'Tech User', role: 'TECHNICIAN' },
      { email: 'customer@fieldsync.com', name: 'Customer User', role: 'CUSTOMER' },
    ];

    for (const u of users) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: {
          email: u.email,
          password: password,
          name: u.name,
          role: u.role,
          ...(u.role !== 'CUSTOMER' ? {
            employee: {
              create: {
                name: u.name,
                phone: '1234567890',
                role: u.role
              }
            }
          } : {
            customer: {
              create: {
                name: u.name,
                phone: '1234567890',
                address: '123 Main St',
                email: u.email
              }
            }
          })
        }
      });
      console.log(`✅ Restored: ${u.email}`);
    }

    console.log('\nUsers restored successfully!');
  } catch (error) {
    console.error('❌ Error restoring users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreUsers();
