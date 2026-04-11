const express = require('express');
const router = express.Router();
const ctrl = require('./integrations.controller');
const { authenticate } = require('../../middlewares/auth');

router.get('/suppliers', authenticate, ctrl.getSuppliers);
router.post('/', authenticate, ctrl.createIntegration);
router.patch('/:id', authenticate, ctrl.updateIntegration);
router.delete('/:id', authenticate, ctrl.removeIntegration);

module.exports = router;
