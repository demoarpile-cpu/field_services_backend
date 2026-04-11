const analyticsService = require('./analytics.service');

const getManagerKPIs = async (req, res, next) => {
  try {
    const kpis = await analyticsService.getManagerKPIs();
    res.json(kpis);
  } catch (error) {
    next(error);
  }
};

const getAdminKPIs = async (req, res, next) => {
  try {
    const kpis = await analyticsService.getAdminKPIs();
    res.json(kpis);
  } catch (error) {
    next(error);
  }
};

const getRevenueHistory = async (req, res, next) => {
  try {
    const data = await analyticsService.getRevenueHistory();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const getJobStats = async (req, res, next) => {
  try {
    const stats = await analyticsService.getJobStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

module.exports = { getManagerKPIs, getAdminKPIs, getRevenueHistory, getJobStats };
