const timesheetsService = require('./timesheets.service');

const getAll = async (req, res, next) => {
  try {
    const rows = await timesheetsService.getAll(req.query);
    res.json(rows);
  } catch (e) { next(e); }
};

const updateStatus = async (req, res, next) => {
  try {
    const row = await timesheetsService.updateStatus(req.params.id, req.body.status);
    res.json(row);
  } catch (e) { next(e); }
};

const clockIn = async (req, res, next) => {
  try {
    const row = await timesheetsService.clockIn(req.user.id, req.body);
    res.json(row);
  } catch (e) { next(e); }
};

const clockOut = async (req, res, next) => {
  try {
    const row = await timesheetsService.clockOut(req.user.id, req.body);
    res.json(row);
  } catch (e) { next(e); }
};

const getMyHistory = async (req, res, next) => {
  try {
    const rows = await timesheetsService.getMyHistory(req.user.id);
    res.json(rows);
  } catch (e) { next(e); }
};

module.exports = { getAll, updateStatus, clockIn, clockOut, getMyHistory };
