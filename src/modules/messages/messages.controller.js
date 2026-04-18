const messagesService = require('./messages.service');
const { getIO, getOnlineUsers } = require('../../socket');

const getConversations = async (req, res, next) => {
  try {
    const data = await messagesService.getConversations(req.user.id);
    res.json(data);
  } catch (e) { next(e); }
};

const getMessages = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { jobId } = req.query;
    const data = await messagesService.getMessages(req.user.id, userId, jobId);
    res.json(data);
  } catch (e) { next(e); }
};

const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content, jobId } = req.body;
    const msg = await messagesService.sendMessage(req.user.id, receiverId, content, jobId);
    const io = getIO();
    const onlineUsers = getOnlineUsers();
    const receiverSocketId = onlineUsers.get(Number(receiverId));

    if (io && receiverSocketId) {
      io.to(receiverSocketId).emit('receive_message', msg);
    }

    res.status(201).json(msg);
  } catch (e) { next(e); }
};

const markRead = async (req, res, next) => {
  try {
    const result = await messagesService.markRead(req.user.id, req.params.userId);
    res.json(result);
  } catch (e) { next(e); }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await messagesService.getUsers(req.user);
    res.json(users);
  } catch (e) { next(e); }
};

const deleteConversation = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await messagesService.deleteConversation(req.user.id, userId);
    res.json(result);
  } catch (e) { next(e); }
};

const deleteAllMessages = async (req, res, next) => {
  try {
    const result = await messagesService.deleteAllMessages(req.user.id);
    res.json(result);
  } catch (e) { next(e); }
};

const deleteMessages = async (req, res, next) => {
  try {
    const { ids } = req.body;
    const result = await messagesService.deleteMessages(req.user.id, ids);
    res.json(result);
  } catch (e) { next(e); }
};

const getTeamMessages = async (req, res, next) => {
  try {
    const messages = await messagesService.getTeamMessages();
    res.json(messages);
  } catch (e) {
    next(e);
  }
};

const sendTeamMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    const message = await messagesService.sendTeamMessage(req.user.id, content);
    res.json(message);
  } catch (e) {
    next(e);
  }
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
