const prisma = require('../../config/db');

const createEvent = async (data, userId) => {
  return await prisma.calendarEvent.create({
    data: {
      title: data.title,
      date: new Date(data.date),
      time: data.time || null,
      notes: data.notes || null,
      priority: data.priority || 'Medium',
      technicianId: data.technicianId ? parseInt(data.technicianId) : null,
      jobId: data.jobId ? parseInt(data.jobId) : null,
      customerId: data.customerId ? parseInt(data.customerId) : null,
      createdById: userId
    },
    include: {
      technician: {
        select: { name: true, role: true }
      },
      customer: {
        select: { name: true, email: true }
      }
    }
  });
};

const getEvents = async () => {
  return await prisma.calendarEvent.findMany({
    orderBy: {
      date: 'asc'
    },
    include: {
      technician: {
        select: { name: true, id: true, role: true }
      },
      customer: {
        select: { name: true, id: true, email: true }
      },
      job: {
        select: { id: true, title: true }
      }
    }
  });
};

module.exports = {
  createEvent,
  getEvents
};
