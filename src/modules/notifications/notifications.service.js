const prisma = require('../../config/db');
const { getIO, getOnlineUsers } = require('../../socket');

/**
 * Fetch all notifications for a specific user
 */
const getNotifications = async (userId) => {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50 // Limit to last 50 for performance
  });
};

/**
 * Mark a specific notification as read
 */
const markAsRead = async (id, userId) => {
  return await prisma.notification.updateMany({
    where: { id: parseInt(id), userId },
    data: { isRead: true }
  });
};

/**
 * Mark all notifications as read for a specific user
 */
const markAllAsRead = async (userId) => {
  return await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true }
  });
};

/**
 * Clear all notifications for a specific user
 */
const clearNotifications = async (userId) => {
  return await prisma.notification.deleteMany({
    where: { userId }
  });
};

/**
 * Internal/Helper Function: Create and send a notification
 * This is used by other modules (Jobs, Messages, etc.)
 */
const createNotification = async (userId, data) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
        isRead: false
      }
    });

    // Push real-time via Socket.io if user is online
    const io = getIO();
    const onlineUsers = getOnlineUsers();
    const receiverSocketId = onlineUsers.get(Number(userId));

    if (io && receiverSocketId) {
      console.log(`[Notification] Pushing real-time to User ${userId}`);
      io.to(receiverSocketId).emit('new_notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    // Don't throw error to avoid crashing the main process (e.g., job assignment)
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  clearNotifications,
  createNotification
};
