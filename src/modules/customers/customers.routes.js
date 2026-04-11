const express = require('express');
const router = express.Router();
const customersController = require('./customers.controller');
const { authenticate } = require('../../middlewares/auth');

router.get('/', authenticate, customersController.getAll);
router.post('/', authenticate, customersController.create);
router.put('/:id', authenticate, customersController.update);
router.delete('/:id', authenticate, customersController.remove);
router.get('/:id/financial-summary', authenticate, customersController.getFinancialSummary);

module.exports = router;
