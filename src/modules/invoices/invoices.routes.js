const express = require('express');
const router = express.Router();
const invoicesController = require('./invoices.controller');
const { authenticate } = require('../../middlewares/auth');

router.get('/', authenticate, invoicesController.getAll);
router.post('/', authenticate, invoicesController.create);
router.put('/:id', authenticate, invoicesController.update);
router.delete('/:id', authenticate, invoicesController.remove);

module.exports = router;
