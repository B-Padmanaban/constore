const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { protect, admin, superAdmin } = require('../middleware/authMiddleware');

// Update own profile
router.put('/profile', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  user.name  = req.body.name  || user.name;
  user.email = req.body.email || user.email;
  user.phone = req.body.phone || user.phone;
  if (req.body.password) user.password = req.body.password;
  const updated = await user.save();
  res.json({ _id: updated._id, name: updated.name, email: updated.email, phone: updated.phone, role: updated.role });
}));

// Get all users — admin+
router.get('/', protect, admin, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role } = req.query;
  const query = {};
  if (search) query.$or = [
    { name:  { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];
  if (role) query.role = role;
  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(query),
  ]);
  res.json({ users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
}));

// Update user role — superadmin only
router.put('/:id/role', protect, superAdmin, asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['user', 'staff', 'admin', 'superadmin'].includes(role)) {
    res.status(400); throw new Error('Invalid role');
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json(user);
}));

// Toggle user active status — superadmin only
router.put('/:id/status', protect, superAdmin, asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: req.body.isActive },
    { new: true }
  );
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json(user);
}));

module.exports = router;