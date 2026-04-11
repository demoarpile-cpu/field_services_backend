const financingService = require('./financing.service');

const getApplications = async (req, res) => {
  try {
    const apps = await financingService.getAllApplications(req.query);
    res.json(apps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const submitApplication = async (req, res) => {
  try {
    const app = await financingService.createApplication(req.body);
    res.status(201).json(app);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const app = await financingService.updateStatus(id, status);
    res.json(app);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProviders = async (req, res) => {
  try {
    const providers = await financingService.getProviders();
    res.json(providers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getApplications,
  submitApplication,
  updateApplicationStatus,
  getProviders
};
