import express, { Application } from "express";
import cors from "cors";
import { config } from "./config";
import bookingRoutes from "./routes/bookingRoutes";

export function createApp(): Application {
  const app = express();

  // Middleware
  app.use(cors({ origin: config.corsOrigins }));
  app.use(express.json());

  // Health check endpoint
  app.get("/health", (_req, res) => {
    res.json({ 
      status: "ok", 
      service: config.serviceName,
      instanceId: config.instanceId,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // Service info endpoint
  app.get("/info", (_req, res) => {
    res.json({
      service: config.serviceName,
      instanceId: config.instanceId,
      version: "1.0.0",
      port: config.port,
      host: config.host,
      environment: config.nodeEnv
    });
  });

  // Routes
  app.use("/api/bookings", bookingRoutes);
  app.use("/bookings", bookingRoutes); // Legacy route support

  return app;
}
