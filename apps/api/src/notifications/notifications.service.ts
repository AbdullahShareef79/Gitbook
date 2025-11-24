import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { encodeCursor, decodeCursor } from '../common/pagination';

export type NotificationType = 'LIKE' | 'BOOKMARK' | 'COMMENT' | 'FOLLOW' | 'JAM_INVITE' | 'mention' | 'message';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    userId: string;
    type: NotificationType;
    refId?: string;
    meta?: any;
  }): Promise<void> {
    try {
      await this.prisma.pool.query(
        `INSERT INTO "Notification" (id, "userId", type, "refId", meta, "createdAt")
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW())`,
        [data.userId, data.type, data.refId || null, data.meta ? JSON.stringify(data.meta) : null]
      );
    } catch (error) {
      console.error('Failed to create notification:', error.message);
    }
  }

  async getNotifications(userId: string, cursor?: string, limit = 20) {
    const decodedCursor = decodeCursor(cursor);
    
    let query = `
      SELECT 
        n.*,
        CASE 
          WHEN n.type IN ('LIKE', 'BOOKMARK', 'COMMENT') THEN
            json_build_object(
              'id', p.id,
              'type', p.type,
              'content', p.content,
              'author', json_build_object('id', pu.id, 'handle', pu.handle, 'name', pu.name, 'image', pu.image)
            )
          WHEN n.type = 'FOLLOW' THEN
            json_build_object(
              'id', fu.id,
              'handle', fu.handle,
              'name', fu.name,
              'image', fu.image
            )
          ELSE NULL
        END as ref_data
      FROM "Notification" n
      LEFT JOIN "Post" p ON n."refId" = p.id AND n.type IN ('LIKE', 'BOOKMARK', 'COMMENT')
      LEFT JOIN "User" pu ON p."authorId" = pu.id
      LEFT JOIN "User" fu ON n."refId" = fu.id AND n.type = 'FOLLOW'
      WHERE n."userId" = $1
    `;

    const params: any[] = [userId];
    
    if (decodedCursor) {
      query += ` AND (n."createdAt", n.id) < ($2::timestamptz, $3)`;
      params.push(decodedCursor.createdAt, decodedCursor.id);
    }

    query += ` ORDER BY n."createdAt" DESC, n.id DESC LIMIT $${params.length + 1}`;
    params.push(limit + 1);

    const result = await this.prisma.pool.query(query, params);
    const rows = result.rows;

    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit).map(row => ({
      ...row,
      meta: typeof row.meta === 'string' ? JSON.parse(row.meta) : row.meta,
    }));

    let nextCursor: string | undefined;
    if (hasMore && items.length > 0) {
      const lastItem = items[items.length - 1];
      nextCursor = encodeCursor({
        createdAt: lastItem.createdAt,
        id: lastItem.id,
      });
    }

    return { items, nextCursor };
  }

  async getUnreadCount(userId: string): Promise<number> {
    const result = await this.prisma.pool.query(
      `SELECT COUNT(*) as count FROM "Notification" WHERE "userId" = $1 AND "readAt" IS NULL`,
      [userId]
    );
    return parseInt(result.rows[0]?.count || '0');
  }

  async markAsRead(userId: string, ids?: string[]): Promise<void> {
    if (ids && ids.length > 0) {
      await this.prisma.pool.query(
        `UPDATE "Notification" SET "readAt" = NOW() WHERE "userId" = $1 AND id = ANY($2) AND "readAt" IS NULL`,
        [userId, ids]
      );
    } else {
      // Mark all as read
      await this.prisma.pool.query(
        `UPDATE "Notification" SET "readAt" = NOW() WHERE "userId" = $1 AND "readAt" IS NULL`,
        [userId]
      );
    }
  }
}
