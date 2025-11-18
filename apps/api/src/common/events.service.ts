import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async log(userId: string | null, kind: string, payload?: any): Promise<void> {
    try {
      await this.prisma.pool.query(
        `INSERT INTO "Event" (id, "userId", kind, payload, "createdAt")
         VALUES (gen_random_uuid()::text, $1, $2, $3, NOW())`,
        [userId, kind, payload ? JSON.stringify(payload) : null]
      );
    } catch (error) {
      // Log but don't throw - analytics shouldn't break app flow
      console.error(`Failed to log event ${kind}:`, error.message);
    }
  }
}
