const leadService = require('./leads.service');

/**
 * Public Lead Create
 */
const createLead = async (req, res) => {
  try {
    const lead = await leadService.create(req.body);
    res.status(201).json({ success: true, data: lead });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Admin/Manager Methods
 */
const getAllLeads = async (req, res) => {
  try {
    const leads = await leadService.getAll();
    res.json({ success: true, data: leads });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch leads' });
  }
};

const getLeadById = async (req, res) => {
  try {
    const lead = await leadService.getById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
    res.json({ success: true, data: lead });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching lead' });
  }
};

const updateLeadStatus = async (req, res) => {
  try {
    const lead = await leadService.updateStatus(req.params.id, req.body.status);
    res.json({ success: true, data: lead });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const proposeSchedule = async (req, res) => {
  try {
    const lead = await leadService.proposeSchedule(req.params.id, req.body);
    res.json({ success: true, data: lead });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const updateLeadPricing = async (req, res) => {
  try {
    const lead = await leadService.updatePricing(req.params.id, req.body);
    res.json({ success: true, data: lead });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const convertToJob = async (req, res) => {
  try {
    const job = await leadService.convertToJob(req.params.id, req.body);
    res.json({ success: true, data: job });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = {
  createLead,
  getAllLeads,
  getLeadById,
  updateLeadStatus,
  proposeSchedule,
  updateLeadPricing,
  convertToJob
};
