const express = require('express');
const router = express.Router();
const calendarController = require('./calendar.controller');

// Use a lazy-require to avoid circular dependency with auth middleware during startup
const getAuthMiddleware = () => require('../../middlewares/auth').authenticate;

router.get('/events', (req, res, next) => getAuthMiddleware()(req, res, next), calendarController.getEvents);
router.post('/events', (req, res, next) => getAuthMiddleware()(req, res, next), calendarController.createEvent);

module.exports = router;
