const customerPortalService = require('./customer-portal.service');

const getMyActiveJob = async (req, res, next) => {
  try {
    const job = await customerPortalService.getMyActiveJob(req.user.id);
    if (!job) return res.status(200).json(null);
    res.json(job);
  } catch (e) { next(e); }
};

const getMyJobsHistory = async (req, res, next) => {
  try {
    const jobs = await customerPortalService.getMyJobsHistory(req.user.id);
    res.json(jobs);
  } catch (e) { next(e); }
};

const getMyEstimates = async (req, res, next) => {
  try {
    const estimates = await customerPortalService.getMyEstimates(req.user.id);
    res.json(estimates);
  } catch (e) { next(e); }
};

const getMyInvoices = async (req, res, next) => {
  try {
    const invoices = await customerPortalService.getMyInvoices(req.user.id);
    res.json(invoices);
  } catch (e) { next(e); }
};

const getJobDetails = async (req, res, next) => {
  try {
    const job = await customerPortalService.getJobDetails(req.user.id, req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found or access denied' });
    res.json(job);
  } catch (e) { next(e); }
};

const updateEstimateStatus = async (req, res, next) => {
  try {
    const estimate = await customerPortalService.updateEstimateStatus(req.user.id, req.params.id, req.body.status);
    res.json(estimate);
  } catch (e) { next(e); }
};

const processPayment = async (req, res, next) => {
  try {
    const invoice = await customerPortalService.processPayment(req.user.id, req.params.id);
    res.json(invoice);
  } catch (e) { next(e); }
};

const getCustomerMessages = async (req, res, next) => {
  try {
    const messages = await customerPortalService.getCustomerMessages(req.user.id);
    res.json(messages);
  } catch (e) { next(e); }
};

const sendCustomerMessage = async (req, res, next) => {
  try {
    const message = await customerPortalService.sendCustomerMessage(req.user.id, req.body.content);
    res.json(message);
  } catch (e) { next(e); }
};

module.exports = {
  getMyActiveJob,
  getMyJobsHistory,
  getMyEstimates,
  getMyInvoices,
  getJobDetails,
  updateEstimateStatus,
  processPayment,
  getCustomerMessages,
  sendCustomerMessage
};
