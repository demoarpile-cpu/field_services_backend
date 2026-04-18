const settingsService = require('./settings.service');

exports.getSettings = async (req, res) => {
  try {
    const settings = await settingsService.getSettings();

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const updatedData = req.body;
    const settings = await settingsService.updateSettings(updatedData);

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Failed to update settings:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getBusinessSettings = async (req, res) => {
  try {
    const businessSettings = await settingsService.getBusinessSettings();
    res.json({
      success: true,
      data: businessSettings
    });
  } catch (error) {
    console.error('Failed to fetch business settings:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.upsertBusinessSettings = async (req, res) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const settings = await settingsService.updateBusinessSettings(req.body);
    const businessSettings = settingsService.pickBusinessFields(settings);

    res.json({
      success: true,
      data: businessSettings
    });
  } catch (error) {
    console.error('Failed to update business settings:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.uploadBusinessLogo = async (req, res) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Logo image is required' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const logoUrl = `${baseUrl}/uploads/branding/${req.file.filename}`;
    const updated = await settingsService.updateBusinessSettings({ logoUrl });

    res.json({
      success: true,
      data: {
        logoUrl: updated.logoUrl || logoUrl
      }
    });
  } catch (error) {
    if (error?.message === 'Only image files are allowed') {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Failed to upload business logo:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
