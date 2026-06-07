const express = require('express');
const router  = express.Router();
const { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct, createReview } = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

const handleUpload = (req, res, next) => {
  const ct = req.headers['content-type'] || '';
  if (ct.includes('multipart/form-data')) {
    return upload.array('images', 5)(req, res, next);
  }
  next();
};

router.get('/',            getProducts);
router.get('/:slug',       getProductBySlug);
router.post('/',           protect, admin, handleUpload, createProduct);
router.put('/:id',         protect, admin, handleUpload, updateProduct);
router.delete('/:id',      protect, admin, deleteProduct);
router.post('/:id/reviews',protect, createReview);

module.exports = router;