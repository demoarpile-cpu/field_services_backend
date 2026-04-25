const express = require('express');
const router = express.Router();
const searchController = require('./search.controller');
const { authenticate } = require('../../middlewares/auth');

router.get('/', authenticate, searchController.globalSearch);

module.exports = router;
