const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);
  
  const users = [
    { email: 'admin@fieldsync.com', name: 'Admin User', role: 'ADMIN' },
    { email: 'manager@fieldsync.com', name: 'Manager User', role: 'MANAGER' },
    { email: 'tech@fieldsync.com', name: 'Tech User', role: 'TECHNICIAN' },
    { email: 'customer@fieldsync.com', name: 'Customer User', role: 'CUSTOMER' },
  ];

  for (const u of users) {
    const user = await prisma.user.upsert({
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
    console.log(`Upserted user: ${user.email}`);
  }

  // Get references
  const manager = await prisma.user.findUnique({ where: { email: 'manager@fieldsync.com' }, include: { employee: true } });
  const tech = await prisma.user.findUnique({ where: { email: 'tech@fieldsync.com' }, include: { employee: true } });
  const customer = await prisma.user.findUnique({ where: { email: 'customer@fieldsync.com' }, include: { customer: true } });

  // Create Sample Jobs
  await prisma.job.createMany({
    data: [
      { customerId: customer.customer.id, title: 'AC Maintenance', description: 'Routine checkup', status: 'SCHEDULED', assignedTo: tech.employee.id, scheduledAt: new Date() },
      { customerId: customer.customer.id, title: 'Pipe Leak', description: 'Emergency repair', status: 'IN_PROGRESS', assignedTo: tech.employee.id, scheduledAt: new Date() },
      { customerId: customer.customer.id, title: 'Electrical Wiring', description: 'New installation', status: 'SCHEDULED', assignedTo: null, scheduledAt: new Date() },
    ]
  });

  // Create Sample Timesheets
  await prisma.timesheet.createMany({
    data: [
      { employeeId: tech.employee.id, date: new Date(), clockIn: new Date(), status: 'PENDING' },
      { employeeId: tech.employee.id, date: new Date(), clockIn: new Date(), clockOut: new Date(), status: 'APPROVED' },
    ]
  });

  // Create Sample Material Requests
  await prisma.materialRequest.createMany({
    data: [
      { employeeId: tech.employee.id, name: 'Copper Pipe', sku: 'CP-100', quantity: 5, status: 'PENDING' },
      { employeeId: tech.employee.id, name: 'PVC Joint', sku: 'PVC-50', quantity: 10, status: 'APPROVED' },
    ]
  });

  console.log('Seeded jobs, timesheets, and material requests.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
