const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const axios = require('axios');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const orderItemSchema = new mongoose.Schema(
  {
    foodId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    items: { type: [orderItemSchema], required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'DELIVERING', 'COMPLETED'],
      default: 'PENDING'
    }
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
const cartServiceUrl = process.env.CART_SERVICE_URL || 'http://localhost:6002';

const getUserId = (req) => req.header('x-user-id') || req.query.userId || 'demo-user';

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'order-service' });
});

app.post('/api/orders/checkout', async (req, res) => {
  const userId = getUserId(req);
  const cartRes = await axios.get(`${cartServiceUrl}/internal/cart/${userId}`);
  const cart = cartRes.data;

  if (!cart.items || cart.items.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  const totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = await Order.create({
    userId,
    items: cart.items,
    totalAmount,
    status: 'PENDING'
  });

  await axios.post(`${cartServiceUrl}/internal/cart/${userId}/clear`);

  return res.status(201).json(order);
});

app.get('/api/orders', async (req, res) => {
  const userId = getUserId(req);
  const orders = await Order.find({ userId }).sort({ createdAt: -1 });
  res.json(orders);
});

const start = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ofd_order_service');
  const port = Number(process.env.PORT) || 6003;
  app.listen(port, () => {
    console.log(`order-service running at http://localhost:${port}`);
  });
};

start();
