import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
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
    // TODO: Add Prisma $queryRaw to verify DB connection
    return {
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    };
  }
}
