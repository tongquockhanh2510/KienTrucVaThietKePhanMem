import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class MariaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(MariaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('MariaDB connected successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown database error';
      this.logger.error(
        `MariaDB connection failed: ${message}. Check DATABASE_URL_MARIA and ensure MariaDB is running.`,
      );
    }
  }
}