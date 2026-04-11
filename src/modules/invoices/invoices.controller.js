const invoicesService = require('./invoices.service');

const getAll = async (req, res, next) => {
  try {
    const invoices = await invoicesService.getAll(req.user);
    res.json(invoices);
  } catch (error) {
    next(error);
  }
};
const create = async (req, res, next) => {
  try {
    const invoice = await invoicesService.create(req.body);
    res.status(201).json(invoice);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const invoice = await invoicesService.update(req.params.id, req.body);
    res.json(invoice);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await invoicesService.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, create, update, remove };
