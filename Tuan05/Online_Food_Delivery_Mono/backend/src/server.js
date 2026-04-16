const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const connectDb = require('./config/db');
const foodRoutes = require('./routes/foods');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');

dotenv.config();
connectDb();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', architecture: 'monolith' });
});

app.use('/api/foods', foodRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
});

const port = Number(process.env.PORT) || 5000;
app.listen(port, () => {
  console.log(`Monolith server running at http://localhost:${port}`);
});
