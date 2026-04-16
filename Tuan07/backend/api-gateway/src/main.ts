import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    credentials: true,
  });
  try {
    await app.listen(config.port, config.host);
    console.log(`API Gateway running on ${config.host}:${config.port}`);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EADDRINUSE') {
      console.error(
        `Port ${config.port} is already in use. Stop the process on this port before starting api-gateway again.`
      );
      process.exit(1);
    }

    throw error;
  }
}

bootstrap();
