const prisma = require('../../config/db');
const bcrypt = require('bcrypt');

const getAll = async () => {
  return await prisma.customer.findMany({
    include: { user: { select: { email: true } } }
  });
};

const create = async (customerData) => {
  const { password, confirmPassword, ...rest } = customerData;
  
  // 1. Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: rest.email }
  });
  
  if (existingUser) {
    const error = new Error('A user with this email already exists');
    error.status = 400;
    throw error;
  }

  // 2. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Create User and Customer in a transaction
  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: rest.email,
        password: hashedPassword,
        name: rest.name,
        role: 'CUSTOMER'
      }
    });

    return await tx.customer.create({
      data: {
        ...rest,
        userId: user.id
      }
    });
  });
};

const update = async (id, customerData) => {
  const allowedData = {
    ...(customerData.name !== undefined ? { name: customerData.name } : {}),
    ...(customerData.email !== undefined ? { email: customerData.email } : {}),
    ...(customerData.phone !== undefined ? { phone: customerData.phone } : {}),
    ...(customerData.address !== undefined ? { address: customerData.address } : {})
  };

  return await prisma.customer.update({
    where: { id: parseInt(id) },
    data: allowedData
  });
};

const remove = async (id) => {
  const customerId = parseInt(id);
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  
  if (!customer) return;

  return await prisma.$transaction(async (tx) => {
    const jobs = await tx.job.findMany({
      where: { customerId },
      select: { id: true, estimateId: true }
    });
    const jobIds = jobs.map(job => job.id);
    const estimateIdsFromJobs = jobs.map(job => job.estimateId).filter(Boolean);

    if (jobIds.length > 0) {
      await tx.payment.deleteMany({ where: { invoice: { jobId: { in: jobIds } } } });
      await tx.invoice.deleteMany({ where: { jobId: { in: jobIds } } });
      await tx.jobLedger.deleteMany({ where: { jobId: { in: jobIds } } });
      await tx.calendarEvent.deleteMany({ where: { jobId: { in: jobIds } } });
      await tx.review.deleteMany({ where: { jobId: { in: jobIds } } });
      await tx.message.deleteMany({ where: { jobId: { in: jobIds } } });
      await tx.note.deleteMany({ where: { jobId: { in: jobIds } } });
      await tx.photo.deleteMany({ where: { jobId: { in: jobIds } } });
      await tx.jobFile.deleteMany({ where: { jobId: { in: jobIds } } });
      await tx.jobHistory.deleteMany({ where: { jobId: { in: jobIds } } });
      await tx.jobLocationHistory.deleteMany({ where: { jobId: { in: jobIds } } });
      await tx.job.deleteMany({ where: { id: { in: jobIds } } });
    }

    const estimates = await tx.estimate.findMany({
      where: { customerId },
      select: { id: true }
    });
    const estimateIds = [...new Set([...estimates.map(e => e.id), ...estimateIdsFromJobs])];
    if (estimateIds.length > 0) {
      await tx.estimateItem.deleteMany({ where: { estimateId: { in: estimateIds } } });
      await tx.estimate.deleteMany({ where: { id: { in: estimateIds } } });
    }

    await tx.payment.deleteMany({ where: { invoice: { customerId } } });
    await tx.invoice.deleteMany({ where: { customerId } });
    await tx.financingApplication.deleteMany({ where: { customerId } });
    await tx.calendarEvent.deleteMany({ where: { customerId } });
    await tx.review.deleteMany({ where: { customerId } });

    // Delete customer record first (child)
    await tx.customer.delete({
      where: { id: customerId }
    });
    
    // Then delete associated user record (parent)
    if (customer.userId) {
      await tx.user.delete({
        where: { id: customer.userId }
      });
    }
  });
};

const getFinancialSummary = async (customerId) => {
  const parsedId = parseInt(customerId);
  if (isNaN(parsedId)) {
    const err = new Error('Invalid customer ID');
    err.status = 400;
    throw err;
  }

  // Find all job ledger entries for jobs belonging to this customer
  const ledgers = await prisma.jobLedger.findMany({
    where: {
      job: {
        customerId: parsedId
      }
    }
  });

  let totalDeposits = 0;
  let totalLaborSpent = 0;
  let totalMaterialSpent = 0;

  ledgers.forEach(entry => {
    const amount = parseFloat(entry.amount);
    
    if (entry.type === 'CREDIT') {
      totalDeposits += amount;
    } else if (entry.type === 'DEBIT') {
      if (entry.category === 'LABOR') {
        totalLaborSpent += amount;
      } else if (entry.category === 'MATERIAL') {
        totalMaterialSpent += amount;
      }
    }
  });

  const remainingBalance = totalDeposits - (totalLaborSpent + totalMaterialSpent);

  return {
    totalDeposits,
    totalLaborSpent,
    totalMaterialSpent,
    remainingBalance
  };
};

module.exports = { getAll, create, update, remove, getFinancialSummary };
