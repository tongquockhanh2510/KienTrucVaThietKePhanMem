const { createProxyMiddleware } = require('http-proxy-middleware');

// Configuration references
const USER_API = process.env.USER_SERVICE_URL || 'http://localhost:8081';
const MOVIE_API = process.env.MOVIE_SERVICE_URL || 'http://localhost:8082';
const BOOKING_API = process.env.BOOKING_SERVICE_URL || 'http://localhost:8083';

/**
 * Configure API routes and split them into Query (GET) and Command (POST/PUT/DELETE) flows.
 * This satisfies a basic CQRS implementation at the API Gateway level.
 */
function setupProxies(app) {
    // ---------------------------------------------------------
    // 1. COMMANDS (Write Operations)
    // ---------------------------------------------------------

    // User Commands
    app.use('/api/c/auth', createProxyMiddleware({
        target: USER_API,
        changeOrigin: true,
        pathRewrite: {
            '^/api/c/auth': '/api/auth', // forward to User Service's /api/auth
        },
    }));

    // Movie Commands
    app.use('/api/c/movies', createProxyMiddleware({
        target: MOVIE_API,
        changeOrigin: true,
        pathRewrite: {
            '^/api/c/movies': '/api/movies',
        },
    }));

    // Booking Commands
    app.use('/api/c/bookings', createProxyMiddleware({
        target: BOOKING_API,
        changeOrigin: true,
        pathRewrite: {
            '^/api/c/bookings': '/api/bookings',
        },
    }));


    // ---------------------------------------------------------
    // 2. QUERIES (Read Operations)
    // ---------------------------------------------------------

    // User Queries (e.g., getting user profile)
    app.use('/api/q/users', createProxyMiddleware({
        target: USER_API,
        changeOrigin: true,
        pathRewrite: {
            '^/api/q/users': '/api/users', // assume user service has /api/users for queries
        },
    }));

    // Movie Queries
    app.use('/api/q/movies', createProxyMiddleware({
        target: MOVIE_API,
        changeOrigin: true,
        pathRewrite: {
            '^/api/q/movies': '/api/movies',
        },
    }));

    // Booking Queries
    app.use('/api/q/bookings', createProxyMiddleware({
        target: BOOKING_API,
        changeOrigin: true,
        pathRewrite: {
            '^/api/q/bookings': '/api/bookings',
        },
    }));
}

module.exports = setupProxies;
