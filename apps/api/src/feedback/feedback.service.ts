import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { encodeCursor, decodeCursor } from '../common/pagination';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async createFeedback(userId: string | null, text: string, type: string = 'general'): Promise<any> {
    const result = await this.prisma.pool.query(
      `INSERT INTO "Feedback" (user_id, text, type, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, user_id, text, type, created_at`,
      [userId, text, type]
    );

    return result.rows[0];
  }

  async getFeedback(cursor?: string, limit: number = 20): Promise<any> {
    const decoded = cursor ? decodeCursor(cursor) : null;
    const maxLimit = Math.min(limit, 50);

    const query = decoded
      ? `SELECT f.*, u.name, u.handle
         FROM "Feedback" f
         LEFT JOIN "User" u ON f.user_id = u.id
         WHERE (f.created_at, f.id) < ($1::timestamptz, $2)
         ORDER BY f.created_at DESC, f.id DESC
         LIMIT $3`
      : `SELECT f.*, u.name, u.handle
         FROM "Feedback" f
         LEFT JOIN "User" u ON f.user_id = u.id
         ORDER BY f.created_at DESC, f.id DESC
         LIMIT $1`;

    const params = decoded
      ? [decoded.createdAt, decoded.id, maxLimit + 1]
      : [maxLimit + 1];

    const result = await this.prisma.pool.query(query, params);
    const items = result.rows.slice(0, maxLimit);
    const hasMore = result.rows.length > maxLimit;

    return {
      items,
      nextCursor: hasMore
        ? encodeCursor({
            createdAt: items[items.length - 1].created_at,
            id: items[items.length - 1].id,
          })
        : null,
    };
  }
}
