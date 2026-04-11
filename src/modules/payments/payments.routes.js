const express = require('express');
const router = express.Router();
const paymentsController = require('./payments.controller');
const { authenticate } = require('../../middlewares/auth');

router.get('/', authenticate, paymentsController.getAll);
router.post('/', authenticate, paymentsController.create);
router.post('/:id/allocate', authenticate, paymentsController.allocate);

module.exports = router;
