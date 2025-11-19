import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { encodeCursor, decodeCursor } from '../common/pagination';

@Injectable()
export class ModerationService {
  constructor(private prisma: PrismaService) {}

  async createFlag(userId: string, postId: string, reason: string): Promise<any> {
    const result = await this.prisma.pool.query(
      `INSERT INTO "Flag" (user_id, post_id, reason, status, created_at)
       VALUES ($1, $2, $3, 'OPEN', NOW())
       RETURNING id, user_id, post_id, reason, status, created_at`,
      [userId, postId, reason]
    );

    return result.rows[0];
  }

  async getFlags(cursor?: string, limit: number = 20, status?: string): Promise<any> {
    const decoded = cursor ? decodeCursor(cursor) : null;
    const maxLimit = Math.min(limit, 50);

    const statusFilter = status ? `AND f.status = $${decoded ? 4 : 2}` : '';
    
    const query = decoded
      ? `SELECT f.*, u.name as reporter_name, u.handle as reporter_handle,
               p.content as post_content
         FROM "Flag" f
         LEFT JOIN "User" u ON f.user_id = u.id
         LEFT JOIN "Post" p ON f.post_id = p.id
         WHERE (f.created_at, f.id) < ($1::timestamptz, $2) ${statusFilter}
         ORDER BY f.created_at DESC, f.id DESC
         LIMIT $${decoded ? (status ? 5 : 3) : (status ? 3 : 1)}`
      : `SELECT f.*, u.name as reporter_name, u.handle as reporter_handle,
               p.content as post_content
         FROM "Flag" f
         LEFT JOIN "User" u ON f.user_id = u.id
         LEFT JOIN "Post" p ON f.post_id = p.id
         ${status ? 'WHERE f.status = $2' : ''}
         ORDER BY f.created_at DESC, f.id DESC
         LIMIT $1`;

    const params = decoded
      ? (status ? [decoded.createdAt, decoded.id, maxLimit + 1, status] : [decoded.createdAt, decoded.id, maxLimit + 1])
      : (status ? [maxLimit + 1, status] : [maxLimit + 1]);

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

  async resolveFlag(flagId: string, resolvedBy: string, newStatus: 'RESOLVED' | 'DISMISSED'): Promise<boolean> {
    const result = await this.prisma.pool.query(
      `UPDATE "Flag" 
       SET status = $2, resolved_by = $3, resolved_at = NOW()
       WHERE id = $1 AND status = 'OPEN'
       RETURNING id`,
      [flagId, newStatus, resolvedBy]
    );

    return result.rowCount > 0;
  }
}
