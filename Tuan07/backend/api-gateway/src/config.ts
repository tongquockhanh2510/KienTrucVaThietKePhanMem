export const config = {
  host: process.env.HOST || '0.0.0.0',
  port: Number(process.env.PORT || 8080),
  authServiceUrl: process.env.AUTH_SERVICE_URL || "http://localhost:8081",
  foodServiceUrl: process.env.FOOD_SERVICE_URL || "http://localhost:8082",
  orderServiceUrl: process.env.ORDER_SERVICE_URL || "http://localhost:8083",
  paymentServiceUrl: process.env.PAYMENT_SERVICE_URL || "http://localhost:8084",
};
