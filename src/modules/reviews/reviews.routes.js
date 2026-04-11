const express = require('express');
const router = express.Router();
const reviewsController = require('./reviews.controller');
const { authenticate } = require('../../middlewares/auth');

// GET /api/reviews - Admin only (handled in controller or simple check)
router.get('/', authenticate, (req, res, next) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Only admins can view all reviews' });
    }
    next();
}, reviewsController.listReviews);

// POST /api/reviews - Customer only
router.post('/', authenticate, (req, res, next) => {
    if (req.user.role !== 'CUSTOMER') {
        return res.status(403).json({ message: 'Only customers can submit reviews' });
    }
    next();
}, reviewsController.submitReview);

module.exports = router;
