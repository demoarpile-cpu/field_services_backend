const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./config/env');
const messagesService = require('./modules/messages/messages.service');

let io;
const onlineUsers = new Map(); // userId -> socketId

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Adjust in production
      methods: ["GET", "POST"]
    }
  });

  // Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = Number(socket.userId);
    onlineUsers.set(userId, socket.id);
    console.log(`[Socket] User connected: ${userId} (Socket: ${socket.id})`);

    socket.on('send_message', async (data) => {
      try {
        const { receiverId, content, jobId } = data;
        const senderId = Number(socket.userId);
        const rId = Number(receiverId);

        console.log(`[Socket] Message from ${senderId} to ${rId}: "${content.substring(0, 20)}..."`);

        // 1. Save to DB using existing service
        const savedMessage = await messagesService.sendMessage(senderId, rId, content, jobId);

        // 2. Emit to receiver
        const receiverSocketId = onlineUsers.get(rId);
        if (receiverSocketId) {
          console.log(`[Socket] Delivering to receiver ${rId} (Socket: ${receiverSocketId})`);
          io.to(receiverSocketId).emit('receive_message', savedMessage);
        } else {
          console.log(`[Socket] Receiver ${rId} is offline`);
        }

        // 3. Emit back to sender (to confirm and update UI)
        socket.emit('receive_message', savedMessage);

      } catch (error) {
        console.error('[Socket] send_message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('send_team_message', async (data) => {
      try {
        const { content } = data;
        const senderId = Number(socket.userId);
        if (!content || !String(content).trim()) return;

        const savedMessage = await messagesService.sendTeamMessage(senderId, String(content).trim());
        io.emit('receive_team_message', savedMessage);
      } catch (error) {
        console.error('[Socket] send_team_message error:', error);
        socket.emit('error', { message: 'Failed to send team message' });
      }
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      console.log(`[Socket] User disconnected: ${userId}`);
    });
  });

  return io;
};

const getIO = () => io;
const getOnlineUsers = () => onlineUsers;

module.exports = { initSocket, getIO, getOnlineUsers };
