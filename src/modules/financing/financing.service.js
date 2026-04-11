const prisma = require('../../config/db');

const getAllApplications = async (filters = {}) => {
  const where = {};
  if (filters.status) where.status = filters.status.toUpperCase();
  if (filters.customerId) where.customerId = parseInt(filters.customerId);

  return await prisma.financingApplication.findMany({
    where,
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

const createApplication = async (data) => {
  return await prisma.financingApplication.create({
    data: {
      customerId: parseInt(data.customerId),
      provider: data.provider,
      amount: data.amount,
      annualIncome: data.annualIncome,
      ssnLast4: data.ssn,
      term: data.term || '12 Months',
      apr: data.apr || '0%',
      status: 'PENDING'
    },
    include: {
      customer: true
    }
  });
};

const updateStatus = async (id, status) => {
  return await prisma.financingApplication.update({
    where: { id: parseInt(id) },
    data: { status: status.toUpperCase() }
  });
};

const getProviders = async () => {
  return await prisma.financingProvider.findMany({
    where: { active: true },
    orderBy: { name: 'asc' }
  });
};

module.exports = {
  getAllApplications,
  createApplication,
  updateStatus,
  getProviders
};
