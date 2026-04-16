const express = require('express');
const Food = require('../models/Food');

const router = express.Router();

router.get('/', async (_req, res) => {
  const foods = await Food.find().sort({ createdAt: -1 });
  res.json(foods);
});

router.post('/', async (req, res) => {
  const { name, description, price, imageUrl } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ message: 'name and price are required' });
  }

  const created = await Food.create({ name, description, price, imageUrl });
  return res.status(201).json(created);
});

module.exports = router;
