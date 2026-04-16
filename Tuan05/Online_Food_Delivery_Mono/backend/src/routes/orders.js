const express = require('express');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

const router = express.Router();

const getUserId = (req) => req.header('x-user-id') || req.query.userId || 'demo-user';

router.post('/checkout', async (req, res) => {
  const userId = getUserId(req);
  const cart = await Cart.findOne({ userId });

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  const totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = await Order.create({
    userId,
    items: cart.items,
    totalAmount,
    status: 'PENDING'
  });

  cart.items = [];
  await cart.save();

  return res.status(201).json(order);
});

router.get('/', async (req, res) => {
  const userId = getUserId(req);
  const orders = await Order.find({ userId }).sort({ createdAt: -1 });
  res.json(orders);
});

module.exports = router;
