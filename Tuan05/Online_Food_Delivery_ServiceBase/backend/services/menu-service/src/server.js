const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, default: '' }
  },
  { timestamps: true }
);

const Food = mongoose.model('Food', foodSchema);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'menu-service' });
});

app.get('/api/foods', async (_req, res) => {
  const foods = await Food.find().sort({ createdAt: -1 });
  res.json(foods);
});

app.get('/api/foods/:id', async (req, res) => {
  const food = await Food.findById(req.params.id);
  if (!food) {
    return res.status(404).json({ message: 'Food not found' });
  }
  return res.json(food);
});

app.post('/api/foods', async (req, res) => {
  const { name, description, price, imageUrl } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ message: 'name and price are required' });
  }

  const created = await Food.create({ name, description, price, imageUrl });
  return res.status(201).json(created);
});

const start = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ofd_menu_service');
  const port = Number(process.env.PORT) || 6001;
  app.listen(port, () => {
    console.log(`menu-service running at http://localhost:${port}`);
  });
};

start();
