const customersService = require('./customers.service');

const getAll = async (req, res, next) => {
  try {
    const customers = await customersService.getAll();
    res.json(customers);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const customer = await customersService.create(req.body);
    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const customer = await customersService.update(req.params.id, req.body);
    res.json(customer);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await customersService.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2003') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete customer because they have associated records (e.g., jobs, invoices, estimates).' 
      });
    }
    next(error);
  }
};

const getFinancialSummary = async (req, res, next) => {
  try {
    const summary = await customersService.getFinancialSummary(req.params.id);
    res.json(summary);
  } catch (error) {
    if (error.status === 400) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

module.exports = { getAll, create, update, remove, getFinancialSummary };
