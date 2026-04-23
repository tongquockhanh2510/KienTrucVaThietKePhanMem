import cors from 'cors';
import express from 'express';
import { connectMongoDB } from './config/database';
import { closeBroker, initializeBroker } from './config/broker';
import { env } from './config/env';
import monitorRoutes from './routes/monitorRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { startPaymentConsumer } from './services/paymentConsumer';
import { startNotificationConsumer } from './services/notificationConsumer';

async function startServer(): Promise<void> {
  const app = express();

  app.use(express.json());
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

  app.use('/', monitorRoutes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  await connectMongoDB();
  await initializeBroker();

  await startPaymentConsumer();
  await startNotificationConsumer();

  app.listen(env.servicePort, '0.0.0.0', () => {
    console.log('==============================================');
    console.log(`${env.serviceName} started`);
    console.log(`Service URL: http://${env.serviceIp}:${env.servicePort}`);
    console.log(`MongoDB DB: ${env.mongoDbName}`);
    console.log('Subscribed events: BOOKING_CREATED, PAYMENT_COMPLETED');
    console.log('==============================================');
  });
}

startServer().catch((error) => {
  console.error('Service failed to start:', error);
  process.exit(1);
});

process.on('SIGINT', async () => {
  console.log('Shutting down service...');
  await closeBroker();
  process.exit(0);
});
