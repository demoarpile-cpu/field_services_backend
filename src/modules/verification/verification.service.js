const prisma = require('../../config/db');

const submitRequest = async (userId, data) => {
  const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
  if (!user) throw new Error('User not found');

  // Check if they already have a request
  const existing = await prisma.verificationRequest.findUnique({
    where: { userId: user.id }
  });

  if (existing) {
    if (existing.status === 'APPROVED') {
      throw new Error('Verification already approved');
    }
    // Update existing request
    return await prisma.verificationRequest.update({
      where: { userId: user.id },
      data: {
        idPhotoUrl: data.idPhotoUrl,
        selfieUrl: data.selfieUrl,
        status: 'PENDING',
        reason: null
      }
    });
  }

  // Create new request
  return await prisma.verificationRequest.create({
    data: {
      userId: user.id,
      idPhotoUrl: data.idPhotoUrl,
      selfieUrl: data.selfieUrl,
      status: 'PENDING'
    }
  });
};

const getStatus = async (userId) => {
  const request = await prisma.verificationRequest.findUnique({
    where: { userId: parseInt(userId) },
    include: { user: { select: { id: true, name: true, role: true } } }
  });

  if (!request) return null;
  return request;
};

const getAll = async (filters = {}) => {
  const where = {};
  if (filters.status) where.status = filters.status.toUpperCase();

  return await prisma.verificationRequest.findMany({
    where,
    include: { user: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: 'desc' }
  });
};

const updateStatus = async (id, status, reason = null) => {
  return await prisma.verificationRequest.update({
    where: { id: parseInt(id) },
    data: {
      status: status.toUpperCase(),
      reason: reason
    },
    include: { user: { select: { id: true, name: true, role: true } } }
  });
};

module.exports = { submitRequest, getStatus, getAll, updateStatus };
