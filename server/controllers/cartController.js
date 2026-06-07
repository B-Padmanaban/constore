const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');

// @desc  Get user cart
// @route GET /api/cart
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name price mrp images stock unit slug');
  res.json(cart || { items: [] });
});

// @desc  Add item to cart
// @route POST /api/cart
const addToCart = asyncHandler(async (req, res) => {
  const { productId, qty = 1 } = req.body;
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });
  const existing = cart.items.find(i => i.product.toString() === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.items.push({ product: productId, qty });
  }
  await cart.save();
  await cart.populate('items.product', 'name price mrp images stock unit slug');
  res.json(cart);
});

// @desc  Update cart item qty
// @route PUT /api/cart/:productId
const updateCartItem = asyncHandler(async (req, res) => {
  const { qty } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) { res.status(404); throw new Error('Cart not found'); }
  const item = cart.items.find(i => i.product.toString() === req.params.productId);
  if (!item) { res.status(404); throw new Error('Item not in cart'); }
  if (qty <= 0) {
    cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
  } else {
    item.qty = qty;
  }
  await cart.save();
  await cart.populate('items.product', 'name price mrp images stock unit slug');
  res.json(cart);
});

// @desc  Remove item from cart
// @route DELETE /api/cart/:productId
const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) { res.status(404); throw new Error('Cart not found'); }
  cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
  await cart.save();
  res.json({ message: 'Item removed' });
});

// @desc  Clear cart
// @route DELETE /api/cart
const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
  res.json({ message: 'Cart cleared' });
});

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
