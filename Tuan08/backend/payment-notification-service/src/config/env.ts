import dotenv from 'dotenv';

dotenv.config();

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  serviceName: process.env.SERVICE_NAME || 'payment-notification-service',
  servicePort: toNumber(process.env.SERVICE_PORT, 8084),
  serviceIp: process.env.SERVICE_IP || '127.0.0.1',

  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017',
  mongoDbName: process.env.MONGODB_DB_NAME || 'movie_ticket_system',

  rabbitMqUrl: process.env.RABBITMQ_URL || 'amqp://guest:guest@127.0.0.1:5672',
  rabbitMqExchange: process.env.RABBITMQ_EXCHANGE || 'movie_ticket_events',

  eventBookingCreated: process.env.EVENT_BOOKING_CREATED || 'BOOKING_CREATED',
  eventPaymentCompleted: process.env.EVENT_PAYMENT_COMPLETED || 'PAYMENT_COMPLETED',
  eventBookingFailed: process.env.EVENT_BOOKING_FAILED || 'BOOKING_FAILED',
};
