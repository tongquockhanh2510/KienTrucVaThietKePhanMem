import dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: "src/services/.env" });

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) {
    return fallback;
  }
  return ["true", "1", "yes", "on"].includes(value.toLowerCase());
};

export const config = {
  host: process.env.HOST || "0.0.0.0",
  port: toNumber(process.env.PORT, 8083),
  userServiceUrl: process.env.USER_SERVICE_URL || "http://localhost:8081",
  foodServiceUrl: process.env.FOOD_SERVICE_URL || "http://localhost:8082",
  upstreamTimeoutMs: toNumber(process.env.UPSTREAM_TIMEOUT_MS, 12000),
  independentMode: toBoolean(process.env.ORDER_INDEPENDENT_MODE, true),
  dbHost: process.env.DB_HOST || "localhost",
  dbPort: toNumber(process.env.DB_PORT, 3306),
  dbName: process.env.DB_NAME || "soccial_media",
  dbUser: process.env.DB_USER || "root",
  dbPassword: process.env.DB_PASSWORD || "root",
  corsOrigins: process.env.CORS_ORIGINS || "*",
};
