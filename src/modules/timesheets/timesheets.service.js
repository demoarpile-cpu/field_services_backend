const prisma = require('../../config/db');

const getAll = async (filters = {}) => {
  const where = {};
  if (filters.status) where.status = filters.status.toUpperCase();
  return await prisma.timesheet.findMany({
    where,
    include: { employee: { include: { user: true } } },
    orderBy: { createdAt: 'desc' }
  });
};

const updateStatus = async (id, status) => {
  return await prisma.timesheet.update({
    where: { id: parseInt(id) },
    data: { status: status.toUpperCase() },
    include: { employee: { include: { user: true } } }
  });
};

const clockIn = async (userId, data) => {
  const employee = await prisma.employee.findUnique({ where: { userId: parseInt(userId) } });
  if (!employee) throw new Error('Employee not found');

  const date = data?.date ? new Date(data.date) : new Date();
  date.setUTCHours(0, 0, 0, 0);

  const clockInTime = data?.time ? new Date(data.time) : new Date();

  return await prisma.timesheet.create({
    data: {
      employeeId: employee.id,
      date,
      clockIn: clockInTime,
      status: 'PENDING'
    }
  });
};

const clockOut = async (userId, data) => {
  const employee = await prisma.employee.findUnique({ where: { userId: parseInt(userId) } });
  if (!employee) throw new Error('Employee not found');

  const timesheet = await prisma.timesheet.findFirst({
    where: { employeeId: employee.id, clockOut: null },
    orderBy: { clockIn: 'desc' }
  });

  if (!timesheet) throw new Error('No active timesheet found');

  const clockOutTime = data?.time ? new Date(data.time) : new Date();
  const diffHours = (clockOutTime - new Date(timesheet.clockIn)) / (1000 * 60 * 60);

  return await prisma.timesheet.update({
    where: { id: timesheet.id },
    data: {
      clockOut: clockOutTime,
      totalHours: diffHours
    }
  });
};

const getMyHistory = async (userId) => {
  const employee = await prisma.employee.findUnique({ where: { userId: parseInt(userId) } });
  if (!employee) return [];

  return await prisma.timesheet.findMany({
    where: { employeeId: employee.id },
    orderBy: { clockIn: 'desc' }
  });
};

module.exports = { getAll, updateStatus, clockIn, clockOut, getMyHistory };
