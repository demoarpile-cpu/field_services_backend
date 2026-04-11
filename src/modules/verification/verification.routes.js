const express = require('express');
const router = express.Router();
const ctrl = require('./verification.controller');
const { authenticate } = require('../../middlewares/auth');
const { authorize } = require('../../middlewares/role');

// Admin/Manager routes
router.get('/', authenticate, authorize(['ADMIN', 'MANAGER']), ctrl.getAll);
router.patch('/:id/status', authenticate, authorize(['ADMIN', 'MANAGER']), ctrl.updateStatus);

// User/Technician routes
router.post('/', authenticate, ctrl.submit);
router.get('/my', authenticate, ctrl.getMyStatus);

module.exports = router;
