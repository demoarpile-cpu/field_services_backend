const calendarService = require('./calendar.service');

const createEvent = async (req, res, next) => {
  try {
    const event = await calendarService.createEvent(req.body, req.user.id);
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

const getEvents = async (req, res, next) => {
  try {
    const events = await calendarService.getEvents();
    res.json(events);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEvent,
  getEvents
};
