const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: process.env.SERVICE_NAME || 'user-service',
    instanceId: process.env.INSTANCE_ID || '1',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Service info endpoint
app.get('/info', (req, res) => {
  res.json({
    service: process.env.SERVICE_NAME || 'user-service',
    instanceId: process.env.INSTANCE_ID || '1',
    version: '1.0.0',
    port: process.env.PORT || 8081,
    host: process.env.HOST || 'localhost',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

module.exports = app;
