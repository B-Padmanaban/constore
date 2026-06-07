const express = require('express');
const router = express.Router();
const { getSetting, setSetting } = require('../controllers/settingsController');
const { protect, admin, superAdmin } = require('../middleware/authMiddleware');
const { upload, cloudinary } = require('../config/cloudinary');
const asyncHandler = require('express-async-handler');

// Image upload for settings (logo, favicon)
router.post('/upload', protect, superAdmin, upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) { res.status(400); throw new Error('No file uploaded'); }
  res.json({ url: req.file.path || req.file.location || '' });
}));

// Hero product — admin+
router.get('/hero_product', getSetting);
router.put('/hero_product', protect, admin, setSetting);

// All other settings — superadmin only
router.get('/:key', getSetting);
router.put('/:key', protect, superAdmin, setSetting);

module.exports = router;