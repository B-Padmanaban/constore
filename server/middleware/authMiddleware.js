const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const ROLE_LEVEL = { user: 0, staff: 1, admin: 2, superadmin: 3 };

const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) { res.status(401); throw new Error('Not authorized, no token'); }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch {
    res.status(401);
    throw new Error('Not authorized, token failed');
  }
});

// Exactly staff or above
const staff = (req, res, next) => {
  if (ROLE_LEVEL[req.user?.role] >= ROLE_LEVEL.staff) return next();
  res.status(403); throw new Error('Not authorized');
};

// Admin or above (admin + superadmin)
const admin = (req, res, next) => {
  if (ROLE_LEVEL[req.user?.role] >= ROLE_LEVEL.admin) return next();
  res.status(403); throw new Error('Not authorized as admin');
};

// Superadmin only
const superAdmin = (req, res, next) => {
  if (req.user?.role === 'superadmin') return next();
  res.status(403); throw new Error('Not authorized as super admin');
};

module.exports = { protect, staff, admin, superAdmin };