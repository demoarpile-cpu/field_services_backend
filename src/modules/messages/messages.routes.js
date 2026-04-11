const express = require('express');
const router = express.Router();
const ctrl = require('./messages.controller');
const { authenticate } = require('../../middlewares/auth');

router.get('/users', authenticate, ctrl.getUsers);
router.get('/conversations', authenticate, ctrl.getConversations);
router.get('/team', authenticate, ctrl.getTeamMessages);
router.post('/team', authenticate, ctrl.sendTeamMessage);
router.get('/job/:jobId', authenticate, ctrl.getMessages);
router.get('/:userId', authenticate, ctrl.getMessages);
router.post('/', authenticate, ctrl.sendMessage);
router.patch('/:userId/read', authenticate, ctrl.markRead);
router.delete('/', authenticate, ctrl.deleteAllMessages);
router.delete('/batch', authenticate, ctrl.deleteMessages);
router.delete('/:userId', authenticate, ctrl.deleteConversation);

module.exports = router;
