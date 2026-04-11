const prisma = require('../../config/db');

const bcrypt = require('bcrypt');

const getAll = async (filters = {}) => {
  const where = {};
  if (filters.role) {
    where.role = filters.role;
  }
  return await prisma.employee.findMany({
    where,
    include: { user: { select: { email: true, role: true } } }
  });
};

const create = async (employeeData) => {
  const { password, confirmPassword, status, email, ...rest } = employeeData;
  
  // 1. Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email }
  });
  
  if (existingUser) {
    const error = new Error('A user with this email already exists');
    error.status = 400;
    throw error;
  }

  // 2. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Map role to Uppercase for Enum
  const role = rest.role.toUpperCase();

  // 4. Create User and Employee in a transaction
  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: email,
        password: hashedPassword,
        name: rest.name,
        role: role
      }
    });

    return await tx.employee.create({
      data: {
        ...rest,
        role: role, // Use the uppercased role ('TECHNICIAN', 'MANAGER', 'ADMIN')
        userId: user.id
      }
    });
  });
};

const getAllTimesheets = async () => {
  return await prisma.timesheet.findMany({
    include: { employee: true },
    orderBy: { date: 'desc' }
  });
};

const updateTimesheetStatus = async (id, status) => {
  return await prisma.timesheet.update({
    where: { id: parseInt(id) },
    data: { status }
  });
};

const update = async (id, employeeData) => {
  const { email, name, role, phone, ...rest } = employeeData;
  const employeeId = parseInt(id);
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  
  if (!employee) {
    const error = new Error('Employee not found');
    error.status = 404;
    throw error;
  }

  return await prisma.$transaction(async (tx) => {
    const updatedRole = role ? role.toUpperCase() : employee.role;

    if (employee.userId) {
      // Check if email is being updated and is not taken
      if (email) {
        const existing = await tx.user.findFirst({
          where: { email: email, NOT: { id: employee.userId } }
        });
        if (existing) {
          const err = new Error('Email is already in use by another user');
          err.status = 400;
          throw err;
        }
      }

      await tx.user.update({
        where: { id: employee.userId },
        data: {
          ...(email && { email }),
          ...(name && { name }),
          ...(role && { role: updatedRole })
        }
      });
    }

    return await tx.employee.update({
      where: { id: employeeId },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(role && { role: updatedRole })
      },
      include: { user: { select: { email: true, role: true } } }
    });
  });
};

const remove = async (id) => {
  const employeeId = parseInt(id);
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  
  if (!employee) return;

  return await prisma.$transaction(async (tx) => {
    await tx.employee.delete({
      where: { id: employeeId }
    });
    
    if (employee.userId) {
      await tx.user.delete({
        where: { id: employee.userId }
      });
    }
  });
};

const updateLocation = async (employeeId, { latitude, longitude }) => {
  return await prisma.employee.update({
    where: { id: parseInt(employeeId) },
    data: {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      lastLocationUpdate: new Date()
    }
  });
};

const getLocation = async (employeeId) => {
  return await prisma.employee.findUnique({
    where: { id: parseInt(employeeId) },
    select: {
      latitude: true,
      longitude: true,
      lastLocationUpdate: true,
      name: true
    }
  });
};

module.exports = { getAll, create, update, remove, getAllTimesheets, updateTimesheetStatus, updateLocation, getLocation };
