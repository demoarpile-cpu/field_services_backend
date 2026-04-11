const prisma = require('../../config/db');

const create = async (paymentData) => {
  const payment = await prisma.payment.create({
    data: paymentData
  });

  // Automatically update invoice status to PAID
  if (payment.invoiceId) {
    await prisma.invoice.update({
      where: { id: payment.invoiceId },
      data: { status: 'PAID' }
    });
  }

  return payment;
};

const allocate = async (id, allocationData) => {
  return { message: 'Payment allocated successfully', id, ...allocationData };
};

const getAll = async () => {
  return await prisma.payment.findMany({
    include: { invoice: { include: { job: { include: { customer: true } } } } },
    orderBy: { createdAt: 'desc' }
  });
};

module.exports = { create, allocate, getAll };
