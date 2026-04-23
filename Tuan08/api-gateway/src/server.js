require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const setupProxies = require('./routes/proxyRules');

const app = express();
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || 'localhost';

app.use(cors());
app.use(morgan('dev'));

// Note: Do NOT use express.json() before http-proxy-middleware 
// unless we handle the proxied request body carefully.
// Best practice for API Gateway proxies is to let the proxy handle the raw body.

// Setup proxy routes representing CQRS with load balancing
setupProxies(app);

// API Gateway health check
app.get('/health', (req, res) => {
    res.json({
        status: 'UP',
        service: 'api-gateway',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Root endpoint with information
app.get('/', (req, res) => {
    res.json({
        name: 'API Gateway',
        version: '1.0.0',
        description: 'Multi-service API Gateway with Load Balancing and CQRS',
        documentation: {
            'Service Status': 'GET /api/services/status',
            'Health Check': 'GET /health',
            'User Commands': 'POST /api/c/auth/*',
            'User Queries': 'GET /api/q/users/*',
            'Movie Commands': 'POST/PUT/DELETE /api/c/movies/*',
            'Movie Queries': 'GET /api/q/movies/*',
            'Booking Commands': 'POST/PUT/DELETE /api/c/bookings/*',
            'Booking Queries': 'GET /api/q/bookings/*'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Endpoint ${req.method} ${req.path} does not exist`,
        availableEndpoints: 'GET /'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

app.listen(PORT, HOST, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 API GATEWAY - MULTI-SERVICE LOAD BALANCER');
    console.log('='.repeat(60));
    console.log(`📡 Listening on: http://${HOST}:${PORT}`);
    console.log(`🔄 Load Balancing: ENABLED (Round-robin)`);
    console.log(`📋 CQRS Pattern: Command/Query Split`);
    console.log(`📊 Status URL: http://${HOST}:${PORT}/api/services/status`);
    console.log(`❤️  Health Check: http://${HOST}:${PORT}/health`);
    console.log('='.repeat(60) + '\n');
});
