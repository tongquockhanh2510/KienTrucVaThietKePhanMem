"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const config_1 = require("./config");
const db_1 = require("./db");
const rabbitmq_1 = require("./rabbitmq");
const paymentEvents_1 = require("./services/paymentEvents");
function startServer(app, preferredPort) {
    return new Promise((resolve, reject) => {
        const server = app.listen(preferredPort, config_1.config.host, () => {
            const address = server.address();
            const actualPort = address?.port ?? preferredPort;
            if (actualPort !== preferredPort) {
                console.warn(`⚠️  Port ${preferredPort} is unavailable, switched to ${actualPort}`);
            }
            console.log(`✅ ${config_1.config.serviceName} (Instance ${config_1.config.instanceId}) running on http://${config_1.config.host}:${actualPort}`);
            console.log(`📡 Environment: ${config_1.config.nodeEnv}`);
            console.log(`🌐 USER_SERVICE_URL: ${config_1.config.userServiceUrl}`);
            console.log(`🎥 MOVIE_SERVICE_URL: ${config_1.config.movieServiceUrl}`);
            console.log(`🐰 RABBITMQ_URL: ${config_1.config.rabbitmqUrl}`);
            console.log(`❤️  Health check: GET /health`);
            console.log(`${'='.repeat(60)}\n`);
            resolve();
        });
        server.once("error", (error) => {
            if (error.code === "EADDRINUSE") {
                const nextPort = preferredPort + 1;
                console.warn(`⚠️  Port ${preferredPort} is already in use, retrying on ${nextPort}...`);
                void startServer(app, nextPort).then(resolve).catch(reject);
                return;
            }
            reject(error);
        });
    });
}
async function main() {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎫 ${config_1.config.serviceName.toUpperCase()} (Instance ${config_1.config.instanceId})`);
    console.log(`${'='.repeat(60)}`);
    // Connect to MongoDB (will use in-memory if fails)
    await (0, db_1.connectDatabase)();
    // Connect to RabbitMQ (will log only if fails)
    await (0, rabbitmq_1.connectRabbitMQ)();
    (0, paymentEvents_1.startPaymentEventConsumers)();
    // Create and start Express app
    const app = (0, app_1.createApp)();
    await startServer(app, config_1.config.port);
}
main().catch((error) => {
    console.error("❌ Failed to start server:", error);
    // Don't exit, try to continue
    process.exit(1);
});
//# sourceMappingURL=server.js.map