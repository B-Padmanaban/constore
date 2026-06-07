const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { cloudinary, IS_CONFIGURED } = require('../config/cloudinary');

// @desc  Get all products (with filters, search, pagination)
// @route GET /api/products
const getProducts = asyncHandler(async (req, res) => {
  const { keyword, category, minPrice, maxPrice, sort, page = 1, limit = 12, featured } = req.query;

  const query = { isActive: true };

  if (keyword)  query.$text = { $search: keyword };
  if (featured) query.isFeatured = true;
  if (minPrice || maxPrice) query.price = {
    ...(minPrice && { $gte: Number(minPrice) }),
    ...(maxPrice && { $lte: Number(maxPrice) }),
  };

  // category can arrive as ObjectId or slug string
  if (category) {
    if (mongoose.Types.ObjectId.isValid(category)) {
      query.category = category;
    } else {
      const cat = await Category.findOne({ slug: category, isActive: true });
      query.category = cat ? cat._id : null;
    }
  }

  const sortMap = {
    price_asc:  { price: 1 },
    price_desc: { price: -1 },
    newest:     { createdAt: -1 },
    rating:     { rating: -1 },
  };
  const sortBy = sortMap[sort] || { createdAt: -1 };

  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('category', 'name slug')
      .sort(sortBy)
      .skip(skip)
      .limit(Number(limit)),
    Product.countDocuments(query),
  ]);

  res.json({ products, page: Number(page), pages: Math.ceil(total / Number(limit)), total });
});

// @desc  Get single product by slug
// @route GET /api/products/:slug
const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true })
    .populate('category', 'name slug');
  if (!product) { res.status(404); throw new Error('Product not found'); }
  res.json(product);
});

// @desc  Create product (admin)
// @route POST /api/products
const createProduct = asyncHandler(async (req, res) => {
  const data = { ...req.body };

  // Cast numeric fields (FormData sends everything as strings)
  if (data.price) data.price = Number(data.price);
  if (data.mrp)   data.mrp   = Number(data.mrp);
  if (data.stock) data.stock = Number(data.stock);

  // isFeatured arrives as string "true"/"false" from FormData
  if (typeof data.isFeatured === 'string') {
    data.isFeatured = data.isFeatured === 'true';
  }

  // Attach Cloudinary uploaded images
  if (req.files?.length && IS_CONFIGURED) {
    data.images = req.files.map(f => ({
      url:      f.path,
      publicId: f.filename,
    }));
  }

  // Clear empty optional fields so Mongoose doesn't complain
  if (!data.mrp)   delete data.mrp;
  if (!data.sku)   delete data.sku;
  if (!data.badge || data.badge === '') delete data.badge;

  const product = await Product.create(data);
  res.status(201).json(product);
});

// @desc  Update product (admin)
// @route PUT /api/products/:id
const updateProduct = asyncHandler(async (req, res) => {
  const data = { ...req.body };

  if (data.price) data.price = Number(data.price);
  if (data.mrp)   data.mrp   = Number(data.mrp);
  if (data.stock) data.stock = Number(data.stock);

  if (typeof data.isFeatured === 'string') {
    data.isFeatured = data.isFeatured === 'true';
  }

  if (!data.mrp)   delete data.mrp;
  if (!data.sku)   delete data.sku;
  if (!data.badge || data.badge === '') delete data.badge;

  // If new images uploaded, delete old ones from Cloudinary then replace
  if (req.files?.length && IS_CONFIGURED) {
    const existing = await Product.findById(req.params.id);
    if (existing?.images?.length) {
      await Promise.all(
        existing.images.map(img =>
          cloudinary.uploader.destroy(img.publicId).catch(() => {})
        )
      );
    }
    data.images = req.files.map(f => ({
      url:      f.path,
      publicId: f.filename,
    }));
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    data,
    { new: true, runValidators: true }
  );
  if (!product) { res.status(404); throw new Error('Product not found'); }
  res.json(product);
});

// @desc  Delete product (admin) — soft delete + cleanup Cloudinary images
// @route DELETE /api/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }

  if (IS_CONFIGURED && product.images?.length) {
    await Promise.all(
      product.images.map(img =>
        cloudinary.uploader.destroy(img.publicId).catch(() => {})
      )
    );
  }

  await Product.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ message: 'Product removed' });
});

// @desc  Create product review
// @route POST /api/products/:id/reviews
const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }

  const alreadyReviewed = product.reviews.find(
    r => r.user.toString() === req.user._id.toString()
  );
  if (alreadyReviewed) { res.status(400); throw new Error('Product already reviewed'); }

  product.reviews.push({
    user:    req.user._id,
    name:    req.user.name,
    rating:  Number(rating),
    comment,
  });
  product.numReviews = product.reviews.length;
  product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;
  await product.save();
  res.status(201).json({ message: 'Review added' });
});

module.exports = { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct, createReview };