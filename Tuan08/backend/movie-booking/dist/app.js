"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_1 = require("./config");
const bookingRoutes_1 = __importDefault(require("./routes/bookingRoutes"));
function createApp() {
    const app = (0, express_1.default)();
    // Middleware
    app.use((0, cors_1.default)({ origin: config_1.config.corsOrigins }));
    app.use(express_1.default.json());
    // Health check endpoint
    app.get("/health", (_req, res) => {
        res.json({
            status: "ok",
            service: config_1.config.serviceName,
            instanceId: config_1.config.instanceId,
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    });
    // Service info endpoint
    app.get("/info", (_req, res) => {
        res.json({
            service: config_1.config.serviceName,
            instanceId: config_1.config.instanceId,
            version: "1.0.0",
            port: config_1.config.port,
            host: config_1.config.host,
            environment: config_1.config.nodeEnv
        });
    });
    // Routes
    app.use("/api/bookings", bookingRoutes_1.default);
    app.use("/bookings", bookingRoutes_1.default); // Legacy route support
    return app;
}
//# sourceMappingURL=app.js.map