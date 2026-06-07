const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:    { type: String, required: true },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  slug:        { type: String, unique: true },
  description: { type: String, required: true },
  category:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brand:       { type: String },
  images:      [{ url: String, publicId: String }],
  price:       { type: Number, required: true, min: 0 },
  mrp:         { type: Number },
  unit:        { type: String, default: 'unit', enum: ['unit', 'kg', 'litre', 'bag', 'set'] },
  stock:       { type: Number, required: true, default: 0 },
  sku:         { type: String, unique: true },
  specifications: [{ key: String, value: String }],
  tags:        [String],
  isFeatured:  { type: Boolean, default: false },
  isActive:    { type: Boolean, default: true },
  reviews:     [reviewSchema],
  rating:      { type: Number, default: 0 },
  numReviews:  { type: Number, default: 0 },
  badge:       { type: String, enum: ['New', 'Best Seller', 'Sale', null], default: null },
}, { timestamps: true });

productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
