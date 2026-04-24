import { createApp } from "./app";
import { config } from "./config";
import { connectDatabase } from "./db";
import { connectRabbitMQ } from "./rabbitmq";
import { startPaymentEventConsumers } from "./services/paymentEvents";
import type { AddressInfo } from "node:net";

function startServer(app: ReturnType<typeof createApp>, preferredPort: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const server = app.listen(preferredPort, config.host, () => {
      const address = server.address() as AddressInfo | null;
      const actualPort = address?.port ?? preferredPort;

      if (actualPort !== preferredPort) {
        console.warn(`⚠️  Port ${preferredPort} is unavailable, switched to ${actualPort}`);
      }

      console.log(`✅ ${config.serviceName} (Instance ${config.instanceId}) running on http://${config.host}:${actualPort}`);
      console.log(`📡 Environment: ${config.nodeEnv}`);
      console.log(`🌐 USER_SERVICE_URL: ${config.userServiceUrl}`);
      console.log(`🎥 MOVIE_SERVICE_URL: ${config.movieServiceUrl}`);
      console.log(`🐰 RABBITMQ_URL: ${config.rabbitmqUrl}`);
      console.log(`❤️  Health check: GET /health`);
      console.log(`${'='.repeat(60)}\n`);

      resolve();
    });

    server.once("error", (error: NodeJS.ErrnoException) => {
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
  console.log(`🎫 ${config.serviceName.toUpperCase()} (Instance ${config.instanceId})`);
  console.log(`${'='.repeat(60)}`);

  // Connect to MongoDB (will use in-memory if fails)
  await connectDatabase();

  // Connect to RabbitMQ (will log only if fails)
  await connectRabbitMQ();
  startPaymentEventConsumers();

  // Create and start Express app
  const app = createApp();
  await startServer(app, config.port);
}

main().catch((error) => {
  console.error("❌ Failed to start server:", error);
  // Don't exit, try to continue
  process.exit(1);
});
