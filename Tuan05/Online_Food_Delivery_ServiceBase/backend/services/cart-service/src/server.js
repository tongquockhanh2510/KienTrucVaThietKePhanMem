const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const axios = require('axios');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const cartItemSchema = new mongoose.Schema(
  {
    foodId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    items: { type: [cartItemSchema], default: [] }
  },
  { timestamps: true }
);

const Cart = mongoose.model('Cart', cartSchema);
const menuServiceUrl = process.env.MENU_SERVICE_URL || 'http://localhost:6001';

const getUserId = (req) => req.header('x-user-id') || req.query.userId || 'demo-user';

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'cart-service' });
});

app.get('/api/cart', async (req, res) => {
  const userId = getUserId(req);
  const cart = await Cart.findOne({ userId });
  res.json(cart || { userId, items: [] });
});

app.post('/api/cart/items', async (req, res) => {
  const userId = getUserId(req);
  const { foodId, quantity = 1 } = req.body;

  const foodRes = await axios.get(`${menuServiceUrl}/api/foods/${foodId}`);
  const food = foodRes.data;

  const cart = (await Cart.findOne({ userId })) || new Cart({ userId, items: [] });
  const existing = cart.items.find((item) => item.foodId === foodId);

  if (existing) {
    existing.quantity += Number(quantity);
  } else {
    cart.items.push({
      foodId,
      name: food.name,
      price: food.price,
      quantity: Number(quantity)
    });
  }

  await cart.save();
  res.status(201).json(cart);
});

app.patch('/api/cart/items/:foodId', async (req, res) => {
  const userId = getUserId(req);
  const { quantity } = req.body;
  const cart = await Cart.findOne({ userId });

  if (!cart) {
    return res.status(404).json({ message: 'Cart not found' });
  }

  const item = cart.items.find((entry) => entry.foodId === req.params.foodId);
  if (!item) {
    return res.status(404).json({ message: 'Item not found in cart' });
  }

  item.quantity = Number(quantity);
  await cart.save();
  return res.json(cart);
});

app.delete('/api/cart/items/:foodId', async (req, res) => {
  const userId = getUserId(req);
  const cart = await Cart.findOne({ userId });

  if (!cart) {
    return res.status(404).json({ message: 'Cart not found' });
  }

  cart.items = cart.items.filter((item) => item.foodId !== req.params.foodId);
  await cart.save();
  return res.json(cart);
});

app.get('/internal/cart/:userId', async (req, res) => {
  const cart = await Cart.findOne({ userId: req.params.userId });
  res.json(cart || { userId: req.params.userId, items: [] });
});

app.post('/internal/cart/:userId/clear', async (req, res) => {
  const cart = await Cart.findOneAndUpdate(
    { userId: req.params.userId },
    { items: [] },
    { upsert: true, new: true }
  );
  res.json(cart);
});

const start = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ofd_cart_service');
  const port = Number(process.env.PORT) || 6002;
  app.listen(port, () => {
    console.log(`cart-service running at http://localhost:${port}`);
  });
};

start();
