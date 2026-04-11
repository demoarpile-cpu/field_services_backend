const express = require('express');
const router = express.Router();
const jobLedgerController = require('./jobLedger.controller');

// Lazy load auth middleware to avoid potential circular dependencies
const getAuth = () => require('../../middlewares/auth').authenticate;
const getAuthorize = () => require('../../middlewares/role').authorize;

/**
 * All financial ledger routes require Admin or Manager roles
 */
router.use((req, res, next) => getAuth()(req, res, next));
router.use((req, res, next) => getAuthorize()(['ADMIN', 'MANAGER'])(req, res, next));

// Routes
router.get('/:jobId/ledger', jobLedgerController.getLedger);
router.post('/:jobId/deposits', jobLedgerController.addDeposit);
router.post('/:jobId/expenses', jobLedgerController.addExpense);

module.exports = router;
