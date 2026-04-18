const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const settingsController = require('./settings.controller');
const { authenticate } = require('../../middlewares/auth');

const brandingDir = path.join(__dirname, '../../../uploads/branding');
if (!fs.existsSync(brandingDir)) {
  fs.mkdirSync(brandingDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, brandingDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    cb(null, `logo-${Date.now()}${ext}`);
  }
});

const imageOnlyUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});

router.get('/', authenticate, settingsController.getSettings);
router.put('/', authenticate, settingsController.updateSettings);
router.get('/business', authenticate, settingsController.getBusinessSettings);
router.put('/business', authenticate, settingsController.upsertBusinessSettings);
router.post('/business/logo', authenticate, (req, res, next) => {
  imageOnlyUpload.single('logo')(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'Logo must be smaller than 5MB' });
    }
    if (err?.message === 'Only image files are allowed') {
      return res.status(400).json({ success: false, message: err.message });
    }
    return res.status(400).json({ success: false, message: 'Invalid logo upload request' });
  });
}, settingsController.uploadBusinessLogo);

module.exports = router;
