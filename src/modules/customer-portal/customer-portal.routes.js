const express = require('express');
const router = express.Router();
const customerPortalController = require('./customer-portal.controller');
const { authorize } = require('../../middlewares/role');
const { authenticate } = require('../../middlewares/auth');

router.use(authenticate, authorize('CUSTOMER'));

router.get('/jobs/active', customerPortalController.getMyActiveJob);
router.get('/jobs/history', customerPortalController.getMyJobsHistory);
router.get('/jobs/:id', customerPortalController.getJobDetails);
router.get('/estimates', customerPortalController.getMyEstimates);
router.get('/invoices', customerPortalController.getMyInvoices);
router.patch('/estimates/:id/status', customerPortalController.updateEstimateStatus);
router.post('/invoices/:id/pay', customerPortalController.processPayment);
router.get('/messages', customerPortalController.getCustomerMessages);
router.post('/messages', customerPortalController.sendCustomerMessage);

module.exports = router;
