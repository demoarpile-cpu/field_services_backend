const express = require('express');
const router = express.Router();
const ctrl = require('./materialrequests.controller');
const { authenticate } = require('../../middlewares/auth');
const { authorize } = require('../../middlewares/role');

router.get('/', authenticate, authorize(['ADMIN', 'MANAGER']), ctrl.getAll);
router.patch('/:id/status', authenticate, authorize(['ADMIN', 'MANAGER']), ctrl.updateStatus);

router.post('/', authenticate, authorize(['TECHNICIAN', 'ADMIN', 'MANAGER']), ctrl.create);
router.get('/my', authenticate, authorize(['TECHNICIAN', 'ADMIN', 'MANAGER']), ctrl.getMyRequests);

module.exports = router;
