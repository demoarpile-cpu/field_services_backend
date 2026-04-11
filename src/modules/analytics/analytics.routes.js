const express = require('express');
const router = express.Router();
const analyticsController = require('./analytics.controller');
const { authenticate } = require('../../middlewares/auth');
const { authorize } = require('../../middlewares/role');

router.get('/manager-kpis', authenticate, authorize(['MANAGER', 'ADMIN']), analyticsController.getManagerKPIs);
router.get('/admin-kpis', authenticate, authorize(['ADMIN']), analyticsController.getAdminKPIs);
router.get('/revenue', authenticate, authorize(['ADMIN', 'MANAGER']), analyticsController.getRevenueHistory);
router.get('/job-stats', authenticate, authorize(['ADMIN', 'MANAGER']), analyticsController.getJobStats);

module.exports = router;
