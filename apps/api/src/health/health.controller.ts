import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'devsocial-api',
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Get('db')
  async checkDatabase() {
    try {
      await this.prisma.pool.query('SELECT 1');
      return {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        database: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('feed')
  async checkFeed() {
    try {
      const result = await this.prisma.pool.query(
        'SELECT COUNT(*) as count FROM "Post" LIMIT 1'
      );
      return {
        status: 'ok',
        feed: 'operational',
        postCount: parseInt(result.rows[0].count, 10),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        feed: 'unavailable',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
