import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import config from './config/env';
import { initializeDatabase } from './config/database';
import paymentRoutes from './routes/paymentRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
app.use(
  cors({
    origin: ['http://localhost:3000', `http://${config.node.serviceIp}:3000`],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Routes
app.use('/', paymentRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Khởi tạo Application
async function startServer() {
  try {
    // Khởi tạo database
    await initializeDatabase();

    // Bắt đầu server
    const port = config.node.port;
    const host = '0.0.0.0'; // Lắng nghe từ tất cả network interfaces

    app.listen(port, host, () => {
      console.log('\n' + '='.repeat(60));
      console.log('🚀 Payment Service Started!');
      console.log('='.repeat(60));
      console.log(`📌 Service Name: ${config.node.env.toUpperCase()}`);
      console.log(`🌐 Server: http://0.0.0.0:${port}`);
      console.log(`🔗 Accessible via: http://${config.node.serviceIp}:${port}`);
      console.log(`🗄️  Database: ${config.database.name}@${config.database.host}`);
      console.log(`📞 Order Service: ${config.services.orderService}`);
      console.log('='.repeat(60) + '\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down Payment Service...');
  process.exit(0);
});
