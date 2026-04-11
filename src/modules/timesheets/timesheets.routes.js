const express = require('express');
const router = express.Router();
const ctrl = require('./timesheets.controller');
const { authenticate } = require('../../middlewares/auth');
const { authorize } = require('../../middlewares/role');

router.get('/', authenticate, authorize(['ADMIN', 'MANAGER']), ctrl.getAll);
router.patch('/:id/status', authenticate, authorize(['ADMIN', 'MANAGER']), ctrl.updateStatus);

router.post('/clock-in', authenticate, authorize(['TECHNICIAN']), ctrl.clockIn);
router.post('/clock-out', authenticate, authorize(['TECHNICIAN']), ctrl.clockOut);
router.get('/my-history', authenticate, authorize(['TECHNICIAN']), ctrl.getMyHistory);

module.exports = router;
