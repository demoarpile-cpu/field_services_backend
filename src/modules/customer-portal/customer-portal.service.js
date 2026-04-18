const prisma = require('../../config/db');

const getMyActiveJob = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { customer: true }
  });
  if (!user || !user.customer) return null;

  return prisma.job.findFirst({
    where: {
      customerId: user.customer.id,
      status: { notIn: ['COMPLETED', 'CANCELLED'] }
    },
    include: {
      customer: true,
      technician: { include: { user: true } },
      photos: true,
      notes: true
    },
    orderBy: { scheduledAt: 'asc' }
  });
};

const getMyJobsHistory = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { customer: true }
  });
  if (!user || !user.customer) return [];

  return prisma.job.findMany({
    where: {
      customerId: user.customer.id,
      status: 'COMPLETED'
    },
    include: {
      customer: true,
      technician: { include: { user: true } },
      invoice: true,
      estimate: true
    },
    orderBy: { updatedAt: 'desc' }
  });
};

const getMyEstimates = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { customer: true }
  });
  if (!user || !user.customer) return [];

  const estimates = await prisma.estimate.findMany({
    where: { customerId: user.customer.id },
    include: { items: true },
    orderBy: { createdAt: 'desc' }
  });

  return estimates.map((estimate) => ({
    ...estimate,
    totalAmount: Number(estimate.totalAmount || 0)
  }));
};

const getMyInvoices = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { customer: true }
  });
  if (!user || !user.customer) return [];

  const invoices = await prisma.invoice.findMany({
    where: { customerId: user.customer.id },
    include: { 
      job: {
        include: {
          estimate: {
            include: { items: true }
          }
        }
      } 
    },
    orderBy: { createdAt: 'desc' }
  });

  return invoices.map(inv => ({
    ...inv,
    totalAmount: Number(inv.total),
    amount: Number(inv.total),
    status: inv.status.charAt(0) + inv.status.slice(1).toLowerCase(),
    items: inv.job?.estimate?.items?.map(item => ({
      desc: item.description,
      qty: item.quantity,
      price: Number(item.unitPrice),
      total: Number(item.total)
    })) || []
  }));
};

const getJobDetails = async (userId, jobId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { customer: true }
  });
  if (!user || !user.customer) return null;

  return prisma.job.findFirst({
    where: {
      id: parseInt(jobId),
      customerId: user.customer.id
    },
    include: {
      customer: true,
      technician: { include: { user: true } },
      photos: true,
      notes: true
    }
  });
};

const processPayment = async (userId, invoiceId) => {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { customer: true } });
  if (!user || !user.customer) throw new Error('Customer not found');

  const invoice = await prisma.invoice.findFirst({
    where: { id: parseInt(invoiceId), customerId: user.customer.id }
  });
  if (!invoice) throw new Error('Invoice not found');

  return prisma.invoice.update({
    where: { id: parseInt(invoiceId) },
    data: { 
      status: 'PAID',
      payments: {
        create: { amount: invoice.total, type: 'PORTAL_PAYMENT' }
      }
    }
  });
};

const updateEstimateStatus = async (userId, estimateId, status, customerSignature) => {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { customer: true } });
  if (!user || !user.customer) throw new Error('Customer not found');

  const estimate = await prisma.estimate.findFirst({
    where: { id: parseInt(estimateId), customerId: user.customer.id }
  });
  if (!estimate) throw new Error('Estimate not found');

  const normalizedStatus = String(status || '').toUpperCase();
  const resolvedStatus = normalizedStatus === 'DECLINED' ? 'REJECTED' : normalizedStatus;
  if (!['APPROVED', 'REJECTED'].includes(resolvedStatus)) {
    const error = new Error('Invalid estimate decision');
    error.status = 400;
    throw error;
  }

  if (['APPROVED', 'REJECTED'].includes(String(estimate.status || '').toUpperCase())) {
    const error = new Error('Estimate decision has already been submitted');
    error.status = 400;
    throw error;
  }

  const signatureText = typeof customerSignature === 'string' ? customerSignature.trim() : '';
  if (resolvedStatus === 'APPROVED') {
    if (!signatureText) {
      const error = new Error('Signature is required to approve estimate');
      error.status = 400;
      throw error;
    }
    await prisma.$executeRaw`
      UPDATE estimate
      SET
        status = 'APPROVED',
        customerSignature = ${signatureText},
        approvedAt = ${new Date()},
        declinedAt = NULL
      WHERE id = ${parseInt(estimateId)}
    `;
    return prisma.estimate.findFirst({
      where: { id: parseInt(estimateId), customerId: user.customer.id },
      include: { customer: true, items: true }
    });
  }

  await prisma.$executeRaw`
    UPDATE estimate
    SET
      status = 'REJECTED',
      customerSignature = ${signatureText || estimate.customerSignature || null},
      declinedAt = ${new Date()},
      approvedAt = NULL
    WHERE id = ${parseInt(estimateId)}
  `;
  return prisma.estimate.findFirst({
    where: { id: parseInt(estimateId), customerId: user.customer.id },
    include: { customer: true, items: true }
  });
};

const getCustomerMessages = async (userId) => {
  const admin = await prisma.user.findFirst({ where: { email: 'admin@fieldsync.com' } });
  if (!admin) return [];

  return prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: admin.id },
        { senderId: admin.id, receiverId: userId }
      ]
    },
    include: { sender: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: 'asc' }
  });
};

const sendCustomerMessage = async (userId, content) => {
  const admin = await prisma.user.findFirst({ where: { email: 'admin@fieldsync.com' } });
  if (!admin) throw new Error('Support is currently offline');

  return prisma.message.create({
    data: { senderId: userId, receiverId: admin.id, content },
    include: { sender: { select: { id: true, name: true, role: true } } }
  });
};

module.exports = {
  getMyActiveJob,
  getMyJobsHistory,
  getMyEstimates,
  getMyInvoices,
  getJobDetails,
  processPayment,
  updateEstimateStatus,
  getCustomerMessages,
  sendCustomerMessage
};
