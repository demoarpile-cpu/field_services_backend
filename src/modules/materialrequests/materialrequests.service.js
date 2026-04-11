const prisma = require('../../config/db');

const getAll = async (filters = {}) => {
  const where = {};
  if (filters.status) where.status = filters.status.toUpperCase();
  return await prisma.materialRequest.findMany({
    where,
    include: { employee: { include: { user: true } } },
    orderBy: { createdAt: 'desc' }
  });
};

const updateStatus = async (id, status) => {
  return await prisma.materialRequest.update({
    where: { id: parseInt(id) },
    data: { status: status.toUpperCase() },
    include: { employee: { include: { user: true } } }
  });
};

const create = async (userId, data) => {
  const employee = await prisma.employee.findUnique({ where: { userId: parseInt(userId) } });
  if (!employee) throw new Error('Employee not found');

  return await prisma.materialRequest.create({
    data: {
      employeeId: employee.id,
      name: data.name,
      sku: data.sku || 'N/A',
      quantity: parseInt(data.qty) || parseInt(data.quantity) || 1,
      status: 'PENDING'
    }
  });
};

const getMyRequests = async (userId) => {
  const employee = await prisma.employee.findUnique({ where: { userId: parseInt(userId) } });
  if (!employee) return [];

  return await prisma.materialRequest.findMany({
    where: { employeeId: employee.id },
    orderBy: { createdAt: 'desc' }
  });
};

module.exports = { getAll, updateStatus, create, getMyRequests };
