const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('Starting database cleanup...');
  const stats = {};

  try {
    // 1. Payments
    let res = await prisma.payment.deleteMany();
    stats.Payments = res.count;

    // 2. Messages
    res = await prisma.message.deleteMany();
    stats.Messages = res.count;

    // 3. Timesheets
    res = await prisma.timesheet.deleteMany();
    stats.Timesheets = res.count;

    // 4. Material Requests
    res = await prisma.materialRequest.deleteMany();
    stats.MaterialRequests = res.count;

    // 5. Verification Requests
    res = await prisma.verificationRequest.deleteMany();
    stats.VerificationRequests = res.count;

    // 6. Invoices
    res = await prisma.invoice.deleteMany();
    stats.Invoices = res.count;

    // 7. Estimate Items
    res = await prisma.estimateItem.deleteMany();
    stats.EstimateItems = res.count;

    // 8. Estimates
    res = await prisma.estimate.deleteMany();
    stats.Estimates = res.count;

    // 9. Job Notes & Photos
    res = await prisma.note.deleteMany();
    stats.Notes = res.count;
    
    res = await prisma.photo.deleteMany();
    stats.Photos = res.count;

    // 10. Jobs
    res = await prisma.job.deleteMany();
    stats.Jobs = res.count;

    // 11. Dummy Users and their Customer/Employee records
    const dummyUsers = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: 'Test' } },
          { name: { contains: 'Demo' } },
          { name: { contains: 'Sample' } },
          { name: 'Customer User' },
          { name: 'Tech User' }
        ]
      }
    });

    const userIds = dummyUsers.map(u => u.id);

    res = await prisma.customer.deleteMany({
      where: {
        OR: [
          { userId: { in: userIds } },
          { name: { contains: 'Test' } },
          { name: { contains: 'Demo' } }
        ]
      }
    });
    stats.Customers = res.count;

    res = await prisma.employee.deleteMany({
      where: {
        OR: [
          { userId: { in: userIds } },
          { name: { contains: 'Test' } },
          { name: { contains: 'Demo' } }
        ]
      }
    });
    stats.Employees = res.count;

    res = await prisma.user.deleteMany({
      where: { id: { in: userIds } }
    });
    stats.DummyUsers = res.count;

    console.log('\n✅ Database Cleanup Complete. Records removed:');
    console.table(stats);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();
