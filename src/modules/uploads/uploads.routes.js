const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { authenticate } = require('../../middlewares/auth');

router.post('/', authenticate, upload.single('file'), (req, res) => {
  res.json({ message: 'File uploaded successfully', file: req.file });
});

module.exports = router;
