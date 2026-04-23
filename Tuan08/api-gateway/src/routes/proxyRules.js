const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * Parse multiple service URLs from environment variable
 * Format: "http://host1:port1,http://host2:port2,http://host3:port3"
 */
function parseServiceUrls(envVar, defaultUrls) {
    if (!envVar) {
        return defaultUrls;
    }
    return envVar.split(',').map(url => url.trim());
}

// Parse service URLs with round-robin load balancing support
const userServiceUrls = parseServiceUrls(
    process.env.USER_SERVICE_URLS,
    ['http://localhost:8081']
);

const movieServiceUrls = parseServiceUrls(
    process.env.MOVIE_SERVICE_URLS,
    ['http://localhost:8082']
);

const bookingServiceUrls = parseServiceUrls(
    process.env.BOOKING_SERVICE_URLS,
    ['http://localhost:8083']
);

/**
 * Simple round-robin load balancer
 */
class LoadBalancer {
    constructor(urls) {
        this.urls = urls;
        this.currentIndex = 0;
    }

    getNext() {
        const url = this.urls[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.urls.length;
        return url;
    }

    getAll() {
        return this.urls;
    }
}

const userBalancer = new LoadBalancer(userServiceUrls);
const movieBalancer = new LoadBalancer(movieServiceUrls);
const bookingBalancer = new LoadBalancer(bookingServiceUrls);

// Log service configuration
console.log('🎯 API Gateway Load Balancing Configuration:');
console.log(`  📦 User Service: ${userServiceUrls.join(', ')}`);
console.log(`  🎬 Movie Service: ${movieServiceUrls.join(', ')}`);
console.log(`  🎫 Booking Service: ${bookingServiceUrls.join(', ')}`);

/**
 * Custom router to implement load balancing across multiple instances
 * This middleware dynamically selects a target server using round-robin
 */
function createLoadBalancingMiddleware(balancer, pathRewrite) {
    return (req, res, next) => {
        const target = balancer.getNext();
        req.headers['X-Forwarded-For'] = req.ip;
        req.headers['X-Forwarded-Proto'] = req.protocol;
        
        const proxy = createProxyMiddleware({
            target: target,
            changeOrigin: true,
            pathRewrite: pathRewrite,
            logLevel: 'warn',
            // Error handling for failed requests
            onError: (err, req, res) => {
                console.error(`❌ Proxy error: ${err.message}`);
                res.status(502).json({
                    error: 'Bad Gateway',
                    message: 'Service unavailable'
                });
            }
        });
        
        proxy(req, res, next);
    };
}

/**
 * Configure API routes with load balancing and split them into Query (GET) and Command (POST/PUT/DELETE) flows.
 * This satisfies a basic CQRS implementation at the API Gateway level with horizontal scaling.
 */
function setupProxies(app) {
    console.log('⚙️  Setting up proxy rules with load balancing...');
    
    // ---------------------------------------------------------
    // 1. COMMANDS (Write Operations)
    // ---------------------------------------------------------

    // User Commands - Round-robin across multiple instances
    app.use('/api/c/auth', createLoadBalancingMiddleware(
        userBalancer,
        { '^/': '/api/auth/' }
    ));

    // Movie Commands
    app.use('/api/c/movies', createLoadBalancingMiddleware(
        movieBalancer,
        { '^/': '/api/movies/' }
    ));

    // Booking Commands
    app.use('/api/c/bookings', createLoadBalancingMiddleware(
        bookingBalancer,
        { '^/': '/api/bookings/' }
    ));

    // ---------------------------------------------------------
    // 2. QUERIES (Read Operations)
    // ---------------------------------------------------------

    // User Queries
    app.use('/api/q/users', createLoadBalancingMiddleware(
        userBalancer,
        { '^/': '/api/users/' }
    ));

    // Movie Queries
    app.use('/api/q/movies', createLoadBalancingMiddleware(
        movieBalancer,
        { '^/': '/api/movies/' }
    ));

    // Booking Queries
    app.use('/api/q/bookings', createLoadBalancingMiddleware(
        bookingBalancer,
        { '^/': '/api/bookings/' }
    ));

    // ---------------------------------------------------------
    // 3. SERVICE STATUS & MONITORING
    // ---------------------------------------------------------

    // Service registry endpoint
    app.get('/api/services/status', (req, res) => {
        res.json({
            status: 'OK',
            services: {
                'user-service': {
                    instances: userServiceUrls,
                    count: userServiceUrls.length
                },
                'movie-service': {
                    instances: movieServiceUrls,
                    count: movieServiceUrls.length
                },
                'booking-service': {
                    instances: bookingServiceUrls,
                    count: bookingServiceUrls.length
                }
            },
            timestamp: new Date().toISOString()
        });
    });

    console.log('✅ Proxy rules configured successfully!');
}

module.exports = setupProxies;
