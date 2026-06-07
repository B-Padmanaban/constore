const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const Order = require('../models/Order');

const IS_DEV_MODE =
  !process.env.RAZORPAY_KEY_ID ||
  process.env.RAZORPAY_KEY_ID === 'skip' ||
  process.env.NODE_ENV === 'development';

// Only initialise Razorpay when real keys are present
let razorpay = null;
if (!IS_DEV_MODE) {
  const Razorpay = require('razorpay');
  razorpay = new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// @desc  Create Razorpay order (or mock in dev)
// @route POST /api/payment/create-order
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount, currency = 'INR', orderId } = req.body;

  if (IS_DEV_MODE) {
    // Return a mock Razorpay order so frontend can proceed
    return res.json({
      razorpayOrderId: `mock_order_${Date.now()}`,
      amount: Math.round(amount * 100),
      currency,
      key: 'rzp_test_mock',
      mock: true,
    });
  }

  const options = { amount: Math.round(amount * 100), currency, receipt: orderId };
  const razorpayOrder = await razorpay.orders.create(options);
  res.json({
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    key: process.env.RAZORPAY_KEY_ID,
  });
});

// @desc  Verify Razorpay payment (or mock in dev)
// @route POST /api/payment/verify
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  if (!IS_DEV_MODE) {
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');
    if (expectedSignature !== razorpay_signature) {
      res.status(400); throw new Error('Payment verification failed');
    }
  }

  const order = await Order.findById(orderId);
  if (!order) { res.status(404); throw new Error('Order not found'); }

  order.isPaid = true;
  order.paidAt = Date.now();
  order.orderStatus = 'Confirmed';
  order.paymentResult = {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    status: IS_DEV_MODE ? 'mock_paid' : 'paid',
  };
  await order.save();
  res.json({ success: true, order });
});

module.exports = { createRazorpayOrder, verifyPayment };