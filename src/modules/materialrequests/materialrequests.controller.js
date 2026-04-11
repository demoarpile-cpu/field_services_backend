const materialRequestsService = require('./materialrequests.service');

const getAll = async (req, res, next) => {
  try {
    const rows = await materialRequestsService.getAll(req.query);
    res.json(rows);
  } catch (e) { next(e); }
};

const updateStatus = async (req, res, next) => {
  try {
    const row = await materialRequestsService.updateStatus(req.params.id, req.body.status);
    res.json(row);
  } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    const row = await materialRequestsService.create(req.user.id, req.body);
    res.status(201).json(row);
  } catch (e) { next(e); }
};

const getMyRequests = async (req, res, next) => {
  try {
    const rows = await materialRequestsService.getMyRequests(req.user.id);
    res.json(rows);
  } catch (e) { next(e); }
};

module.exports = { getAll, updateStatus, create, getMyRequests };
