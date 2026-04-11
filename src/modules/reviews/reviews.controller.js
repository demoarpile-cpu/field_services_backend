const reviewsService = require('./reviews.service');

const listReviews = async (req, res, next) => {
    try {
        const reviews = await reviewsService.getAll();
        res.json(reviews);
    } catch (error) {
        next(error);
    }
};

const submitReview = async (req, res, next) => {
    try {
        const review = await reviewsService.create(req.body, req.user);
        res.status(201).json(review);
    } catch (error) {
        next(error);
    }
};

module.exports = { listReviews, submitReview };
