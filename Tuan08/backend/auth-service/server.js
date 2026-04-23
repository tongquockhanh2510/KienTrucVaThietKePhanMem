require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { connectRabbitMQ } = require('./config/rabbitmq');

const PORT = process.env.PORT || 8081;
const HOST = process.env.HOST || 'localhost';
const SERVICE_NAME = process.env.SERVICE_NAME || 'user-service';
const INSTANCE_ID = process.env.INSTANCE_ID || '1';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log(`✅ [${SERVICE_NAME}-${INSTANCE_ID}] Connected to MongoDB`);

    // Connect to RabbitMQ
    await connectRabbitMQ();
    console.log(`✅ [${SERVICE_NAME}-${INSTANCE_ID}] Connected to RabbitMQ`);

    // Start Express server
    app.listen(PORT, HOST, () => {
      console.log(`\n🚀 ${SERVICE_NAME} (Instance ${INSTANCE_ID}) running on http://${HOST}:${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`❤️  Health check: GET /health\n`);
    });
  } catch (error) {
    console.error(`❌ [${SERVICE_NAME}-${INSTANCE_ID}] Failed to start server:`, error);
    process.exit(1);
  }
};

startServer();
