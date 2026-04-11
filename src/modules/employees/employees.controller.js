const employeesService = require('./employees.service');

const getAll = async (req, res, next) => {
  try {
    const employees = await employeesService.getAll(req.query);
    res.json(employees);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const employee = await employeesService.create(req.body);
    res.status(201).json(employee);
  } catch (error) {
    next(error);
  }
};

const getAllTimesheets = async (req, res, next) => {
  try {
    const timesheets = await employeesService.getAllTimesheets();
    res.json(timesheets);
  } catch (error) {
    next(error);
  }
};

const updateTimesheetStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const timesheet = await employeesService.updateTimesheetStatus(id, status);
    res.json(timesheet);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const employee = await employeesService.update(req.params.id, req.body);
    res.json(employee);
  } catch (error) {
    if (error.status === 404) return res.status(404).json({ message: error.message });
    if (error.status === 400) return res.status(400).json({ message: error.message });
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await employeesService.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2003') {
      return res.status(400).json({ 
        message: 'Cannot delete employee because they have assigned jobs or timesheets.' 
      });
    }
    next(error);
  }
};

const updateLocation = async (req, res, next) => {
  try {
    const employeeId = req.user.employee?.id;
    if (!employeeId) {
      return res.status(403).json({ message: 'Only employees can update their location' });
    }
    const location = await employeesService.updateLocation(employeeId, req.body);
    res.json(location);
  } catch (error) {
    next(error);
  }
};

const getLocation = async (req, res, next) => {
  try {
    const location = await employeesService.getLocation(req.params.id);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.json(location);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, create, update, remove, getAllTimesheets, updateTimesheetStatus, updateLocation, getLocation };
