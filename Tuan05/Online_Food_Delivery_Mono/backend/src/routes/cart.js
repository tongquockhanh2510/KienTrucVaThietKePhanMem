const express = require('express');
const Food = require('../models/Food');
const Cart = require('../models/Cart');

const router = express.Router();

const getUserId = (req) => req.header('x-user-id') || req.query.userId || 'demo-user';

router.get('/', async (req, res) => {
  const userId = getUserId(req);
  const cart = await Cart.findOne({ userId });
  res.json(cart || { userId, items: [] });
});

router.post('/items', async (req, res) => {
  const userId = getUserId(req);
  const { foodId, quantity = 1 } = req.body;

  const food = await Food.findById(foodId);
  if (!food) {
    return res.status(404).json({ message: 'Food not found' });
  }

  const cart = (await Cart.findOne({ userId })) || new Cart({ userId, items: [] });
  const index = cart.items.findIndex((item) => item.foodId.toString() === foodId);

  if (index >= 0) {
    cart.items[index].quantity += quantity;
  } else {
    cart.items.push({
      foodId: food._id,
      name: food.name,
      price: food.price,
      quantity
    });
  }

  await cart.save();
  return res.status(201).json(cart);
});

router.patch('/items/:foodId', async (req, res) => {
  const userId = getUserId(req);
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: 'quantity must be >= 1' });
  }

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    return res.status(404).json({ message: 'Cart not found' });
  }

  const item = cart.items.find((entry) => entry.foodId.toString() === req.params.foodId);
  if (!item) {
    return res.status(404).json({ message: 'Item not found in cart' });
  }

  item.quantity = quantity;
  await cart.save();
  return res.json(cart);
});

router.delete('/items/:foodId', async (req, res) => {
  const userId = getUserId(req);
  const cart = await Cart.findOne({ userId });

  if (!cart) {
    return res.status(404).json({ message: 'Cart not found' });
  }

  cart.items = cart.items.filter((item) => item.foodId.toString() !== req.params.foodId);
  await cart.save();
  return res.json(cart);
});

router.delete('/', async (req, res) => {
  const userId = getUserId(req);
  await Cart.findOneAndUpdate({ userId }, { items: [] }, { upsert: true, new: true });
  res.status(204).send();
});

module.exports = router;
