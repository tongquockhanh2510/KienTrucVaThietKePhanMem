import mongoose from 'mongoose';
import { env } from './env';

export async function connectMongoDB(): Promise<void> {
  await mongoose.connect(env.mongoUri, {
    dbName: env.mongoDbName,
  });

  console.log(`MongoDB connected: ${env.mongoUri}/${env.mongoDbName}`);
}
