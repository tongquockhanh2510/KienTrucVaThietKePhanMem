require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const setupProxies = require('./routes/proxyRules');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(morgan('dev'));

// Note: Do NOT use express.json() before http-proxy-middleware 
// unless we handle the proxied request body carefully.
// Best practice for API Gateway proxies is to let the proxy handle the raw body.

// Setup proxy routes representing CQRS
setupProxies(app);

// API Gateway health check
app.get('/health', (req, res) => {
    res.json({
        status: 'UP',
        service: 'api-gateway',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`🚀 API Gateway is running on http://localhost:${PORT}`);
    console.log(`Commands mapped to: /api/c/* `);
    console.log(`Queries mapped to: /api/q/* `);
});
