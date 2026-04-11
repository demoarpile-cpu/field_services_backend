const prisma = require('../../config/db');

const getConversations = async (userId) => {
  // Get all messages where user is sender or receiver, group by the other user
  const messages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }]
    },
    include: {
      sender: { select: { id: true, name: true, role: true } },
      receiver: { select: { id: true, name: true, role: true } },
      job: { select: { id: true, title: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Group into conversations by the other party
  const convMap = new Map();
  for (const msg of messages) {
    const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
    const other = msg.senderId === userId ? msg.receiver : msg.sender;

    // Key could be otherId or otherId + jobId if we want separate threads per job
    // For now, let's keep it per-user as the UI seems to expect that
    if (!convMap.has(otherId)) {
      convMap.set(otherId, { user: other, lastMessage: msg, unread: 0 });
    }
    if (msg.receiverId === userId && !msg.isRead) {
      convMap.get(otherId).unread++;
    }
  }
  return Array.from(convMap.values());
};

const getMessages = async (userId, otherId, jobId = null) => {
  const other = parseInt(otherId);
  const where = {
    OR: [
      { senderId: userId, receiverId: other },
      { senderId: other, receiverId: userId }
    ]
  };

  if (jobId) {
    where.jobId = parseInt(jobId);
  }

  return await prisma.message.findMany({
    where,
    include: {
      sender: { select: { id: true, name: true, role: true } },
      job: { select: { id: true, title: true } }
    },
    orderBy: { createdAt: 'asc' }
  });
};

const sendMessage = async (senderId, receiverId, content, jobId = null) => {
  const data = {
    senderId,
    receiverId: parseInt(receiverId),
    content
  };
  if (jobId) data.jobId = parseInt(jobId);

  const message = await prisma.message.create({
    data,
    include: {
      sender: { select: { id: true, name: true, role: true } },
      job: { select: { id: true, title: true } }
    }
  });

  // Trigger Notification
  const notificationsService = require('../notifications/notifications.service');
  notificationsService.createNotification(data.receiverId, {
    type: 'MESSAGE',
    title: `New Message from ${message.sender.name}`,
    message: content.length > 50 ? content.substring(0, 50) + '...' : content,
    link: `/messages/${senderId}${jobId ? `?jobId=${jobId}` : ''}`
  });

  return message;
};

const markRead = async (userId, otherId) => {
  return await prisma.message.updateMany({
    where: { senderId: parseInt(otherId), receiverId: userId, isRead: false },
    data: { isRead: true }
  });
};

const getUsers = async (user) => {
  const { id: userId, role } = user;

  if (role === 'ADMIN' || role === 'MANAGER') {
    // Admin/Manager can see everyone
    return await prisma.user.findMany({
      where: { id: { not: userId } },
      select: { id: true, name: true, role: true }
    });
  }

  if (role === 'TECHNICIAN') {
    // Technician sees Admin/Manager and Customers of assigned jobs
    const assignedJobs = await prisma.job.findMany({
      where: { technician: { userId: userId } },
      select: { customer: { select: { userId: true } } }
    });
    const customerIds = assignedJobs.map(j => j.customer.userId).filter(id => id !== null);

    return await prisma.user.findMany({
      where: {
        OR: [
          { role: { in: ['ADMIN', 'MANAGER'] } },
          { id: { in: customerIds } }
        ],
        id: { not: userId }
      },
      select: { id: true, name: true, role: true }
    });
  }

  if (role === 'CUSTOMER') {
    // Customer sees Admin/Manager and Technician assigned to their jobs
    const myJobs = await prisma.job.findMany({
      where: { customer: { userId: userId } },
      select: { technician: { select: { userId: true } } }
    });
    const technicianIds = myJobs.map(j => j.technician?.userId).filter(id => id != null);

    return await prisma.user.findMany({
      where: {
        OR: [
          { role: { in: ['ADMIN', 'MANAGER'] } },
          { id: { in: technicianIds } }
        ],
        id: { not: userId }
      },
      select: { id: true, name: true, role: true }
    });
  }

  return [];
};

const deleteConversation = async (userId, otherId) => {
  const other = parseInt(otherId);
  return await prisma.message.deleteMany({
    where: {
      OR: [
        { senderId: userId, receiverId: other },
        { senderId: other, receiverId: userId }
      ]
    }
  });
};

const deleteAllMessages = async (userId) => {
  return await prisma.message.deleteMany({
    where: {
      OR: [
        { senderId: userId },
        { receiverId: userId }
      ]
    }
  });
};

const deleteMessages = async (userId, messageIds) => {
  return await prisma.message.deleteMany({
    where: {
      id: { in: messageIds.map(id => parseInt(id)) },
      OR: [
        { senderId: userId },
        { receiverId: userId }
      ]
    }
  });
};

const getTeamMessages = async () => {
  return await prisma.teamMessage.findMany({
    take: 50,
    orderBy: { createdAt: 'asc' },
    include: {
      sender: { select: { id: true, name: true, role: true } }
    }
  });
};

const sendTeamMessage = async (senderId, content) => {
  return await prisma.teamMessage.create({
    data: { senderId, content },
    include: {
      sender: { select: { id: true, name: true, role: true } }
    }
  });
};

module.exports = { 
  getConversations, 
  getMessages, 
  sendMessage, 
  markRead, 
  getUsers,
  deleteConversation,
  deleteAllMessages,
  deleteMessages,
  getTeamMessages,
  sendTeamMessage
};
