require('dotenv').config();
const express = require('express');
const { connectDB } = require('./config/db');
const foodRoutes = require('./routes/foodRoutes');

const app = express();

// Middleware
app.use(express.json());

// Kết nối DB và Sync Table
connectDB();

// Routes
app.use('/food', foodRoutes);
app.use('/foods', foodRoutes);

app.get('/health', (_req, res) => {
    res.json({ service: 'food-service', status: 'ok' });
});

const PORT = process.env.PORT || 8082;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`Food Service is running on ${HOST}:${PORT}`);
});