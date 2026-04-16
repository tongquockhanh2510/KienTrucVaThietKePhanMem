import dotenv from 'dotenv';

dotenv.config();

export const config = {
  node: {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.SERVICE_PORT || '8084'),
    serviceIp: process.env.SERVICE_IP || 'localhost',
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'food_db',
  },
  services: {
    orderService: process.env.ORDER_SERVICE_URL || 'http://localhost:8083',
    userService: process.env.USER_SERVICE_URL || 'http://localhost:8081',
  },
  payment: {
    timeout: parseInt(process.env.PAYMENT_TIMEOUT || '30000'),
  },
  notification: {
    log: process.env.NOTIFICATION_LOG === 'true',
  },
};

export default config;
