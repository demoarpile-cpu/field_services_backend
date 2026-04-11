const express = require('express');
const router = express.Router();
const financingController = require('./financing.controller');
const { authenticate } = require('../../middlewares/auth');
const { authorize } = require('../../middlewares/role');

router.get('/', authenticate, authorize(['ADMIN', 'MANAGER']), financingController.getApplications);
router.post('/', authenticate, financingController.submitApplication);
router.patch('/:id/status', authenticate, authorize(['ADMIN', 'MANAGER']), financingController.updateApplicationStatus);
router.get('/providers', authenticate, financingController.getProviders);

module.exports = router;
