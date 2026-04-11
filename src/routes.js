const express = require('express');
const router = express.Router();

// Module routes will be imported here
const authRoutes = require('./modules/auth/auth.routes');
const customerRoutes = require('./modules/customers/customers.routes');
const employeeRoutes = require('./modules/employees/employees.routes');
const jobRoutes = require('./modules/jobs/jobs.routes');
const estimateRoutes = require('./modules/estimates/estimates.routes');
const invoiceRoutes = require('./modules/invoices/invoices.routes');
const paymentRoutes = require('./modules/payments/payments.routes');
const uploadRoutes = require('./modules/uploads/uploads.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');
const timesheetsRoutes = require('./modules/timesheets/timesheets.routes');
const materialRequestsRoutes = require('./modules/materialrequests/materialrequests.routes');
const messagesRoutes = require('./modules/messages/messages.routes');
const verificationRoutes = require('./modules/verification/verification.routes');
const financingRoutes = require('./modules/financing/financing.routes');
const customerPortalRoutes = require('./modules/customer-portal/customer-portal.routes');
const integrationsRoutes = require('./modules/integrations/integrations.routes');
const materialsRoutes = require('./modules/materials/materials.routes');

const calendarRoutes = require('./modules/calendar/calendar.routes');
const reviewsRoutes = require('./modules/reviews/reviews.routes');
const jobLedgerRoutes = require('./modules/jobLedger/jobLedger.routes');
const leadRoutes = require('./modules/leads/leads.routes');
const settingsRoutes = require('./modules/settings/settings.routes');
const notificationsRoutes = require('./modules/notifications/notifications.routes');

router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/employees', employeeRoutes);
router.use('/jobs', jobRoutes);
router.use('/estimates', estimateRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/payments', paymentRoutes);
router.use('/uploads', uploadRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/timesheets', timesheetsRoutes);
router.use('/material-requests', materialRequestsRoutes);
router.use('/messages', messagesRoutes);
router.use('/verification', verificationRoutes);
router.use('/financing', financingRoutes);
router.use('/customer', customerPortalRoutes);
router.use('/integrations', integrationsRoutes);
router.use('/materials', materialsRoutes);
router.use('/calendar', calendarRoutes);
router.use('/job-ledger', jobLedgerRoutes);
router.use('/leads', leadRoutes);
router.use('/settings', settingsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/reviews', reviewsRoutes);

module.exports = router;
