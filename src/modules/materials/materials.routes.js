const express = require('express');
const router = express.Router();
const materialsController = require('./materials.controller');
const { authenticate } = require('../../middlewares/auth');

router.use(authenticate);

router.get('/', materialsController.getMaterials);
router.post('/', materialsController.createMaterial);
router.get('/suppliers', materialsController.getSuppliers);
router.get('/pricing', materialsController.getPricing);

module.exports = router;
