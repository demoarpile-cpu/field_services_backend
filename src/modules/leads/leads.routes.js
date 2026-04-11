const express = require('express');
const router = express.Router();
const leadController = require('./leads.controller');
const { authenticate } = require('../../middlewares/auth');
const { authorize } = require('../../middlewares/role');

/**
 * Public Routes
 */
router.post('/', leadController.createLead);

/**
 * Protected Routes (Admin/Manager)
 */
router.get('/', authenticate, authorize(['ADMIN', 'MANAGER']), leadController.getAllLeads);
router.get('/:id', authenticate, authorize(['ADMIN', 'MANAGER']), leadController.getLeadById);
router.patch('/:id/status', authenticate, authorize(['ADMIN', 'MANAGER']), leadController.updateLeadStatus);
router.patch('/:id/pricing', authenticate, authorize(['ADMIN', 'MANAGER']), leadController.updateLeadPricing);
router.post('/:id/propose', authenticate, authorize(['ADMIN', 'MANAGER']), leadController.proposeSchedule);
router.post('/:id/convert', authenticate, authorize(['ADMIN', 'MANAGER']), leadController.convertToJob);

module.exports = router;
