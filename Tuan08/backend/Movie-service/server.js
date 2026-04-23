require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const movieRoutes = require('./routes/movieRoutes');

const app = express();
const PORT = process.env.PORT || 8082;
const HOST = process.env.HOST || 'localhost';
const SERVICE_NAME = process.env.SERVICE_NAME || 'movie-service';
const INSTANCE_ID = process.env.INSTANCE_ID || '1';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/movies', movieRoutes);
app.use('/movies', movieRoutes); // Legacy route support

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: SERVICE_NAME,
    instanceId: INSTANCE_ID,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Service info endpoint
app.get('/info', (req, res) => {
  res.json({
    service: SERVICE_NAME,
    instanceId: INSTANCE_ID,
    version: '1.0.0',
    port: PORT,
    host: HOST,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Connect to MongoDB & Start Server
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log(`✅ [${SERVICE_NAME}-${INSTANCE_ID}] Connected to MongoDB successfully!`);
        app.listen(PORT, HOST, () => {
            console.log(`🚀 ${SERVICE_NAME}-${INSTANCE_ID} running at http://${HOST}:${PORT}`);
            console.log(`📡 Service listening on ${HOST}:${PORT}`);
            console.log(`❤️  Health check: GET /health`);
        });
    })
    .catch((err) => {
        console.error(`❌ [${SERVICE_NAME}-${INSTANCE_ID}] MongoDB connection error: `, err.message);
        process.exit(1);
    });