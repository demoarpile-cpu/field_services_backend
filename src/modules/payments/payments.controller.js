const paymentsService = require('./payments.service');

const create = async (req, res, next) => {
  try {
    const payment = await paymentsService.create(req.body);
    res.status(201).json(payment);
  } catch (error) {
    next(error);
  }
};

const allocate = async (req, res, next) => {
  try {
    const allocation = await paymentsService.allocate(req.params.id, req.body);
    res.json(allocation);
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const payments = await paymentsService.getAll();
    res.json(payments);
  } catch (error) {
    next(error);
  }
};

module.exports = { create, allocate, getAll };
