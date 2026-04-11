const verificationService = require('./verification.service');

const submit = async (req, res, next) => {
  try {
    const request = await verificationService.submitRequest(req.user.id, req.body);
    res.status(201).json(request);
  } catch (e) { next(e); }
};

const getMyStatus = async (req, res, next) => {
  try {
    const status = await verificationService.getStatus(req.user.id);
    if (!status) return res.json({ status: 'NOT_SUBMITTED', message: 'No verification request found' });
    res.json(status);
  } catch (e) { next(e); }
};

const getAll = async (req, res, next) => {
  try {
    const requests = await verificationService.getAll(req.query);
    res.json(requests);
  } catch (e) { next(e); }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    const request = await verificationService.updateStatus(req.params.id, status, reason);
    res.json(request);
  } catch (e) { next(e); }
};

module.exports = { submit, getMyStatus, getAll, updateStatus };
