import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async onModuleInit() {
    // Test connection
    await this.pool.query('SELECT 1');
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  // Post methods
  post = {
    create: async (params: any) => {
      const { data } = params;
      const result = await this.pool.query(
        `INSERT INTO "Post" (id, type, content, "authorId", "createdAt", "updatedAt") 
         VALUES (gen_random_uuid()::text, $1, $2, $3, NOW(), NOW()) 
         RETURNING *`,
        [data.type, JSON.stringify(data.content), data.authorId]
      );
      return result.rows[0];
    },

    findMany: async (params: any = {}) => {
      const limit = params.take || 20;
      let query = `
        SELECT p.*, 
               json_build_object(
                 'id', u.id,
                 'handle', u.handle,
                 'name', u.name,
                 'image', u.image
               ) as author,
               json_build_object(
                 'id', pr.id,
                 'title', pr.title,
                 'summary', pr.summary,
                 'githubUrl', pr."githubUrl",
                 'tags', pr.tags
               ) as project
        FROM "Post" p
        LEFT JOIN "User" u ON p."authorId" = u.id
        LEFT JOIN "Project" pr ON (p.content->>'projectId')::text = pr.id
        ORDER BY p."createdAt" DESC
        LIMIT $1
      `;
      const result = await this.pool.query(query, [limit]);
      return result.rows.map(row => ({
        ...row,
        content: typeof row.content === 'string' ? JSON.parse(row.content) : row.content,
      }));
    },

    findUnique: async (params: any) => {
      const result = await this.pool.query(
        `SELECT p.*, 
                json_build_object('id', u.id, 'handle', u.handle, 'name', u.name, 'image', u.image) as author
         FROM "Post" p
         LEFT JOIN "User" u ON p."authorId" = u.id
         WHERE p.id = $1`,
        [params.where.id]
      );
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        ...row,
        content: typeof row.content === 'string' ? JSON.parse(row.content) : row.content,
      };
    },
  };

  // PostInteraction methods
  postInteraction = {
    findUnique: async (params: any) => {
      const { postId, userId, kind } = params.where.postId_userId_kind;
      const result = await this.pool.query(
        `SELECT * FROM "PostInteraction" WHERE "postId" = $1 AND "userId" = $2 AND kind = $3`,
        [postId, userId, kind]
      );
      return result.rows[0] || null;
    },

    create: async (params: any) => {
      const { data } = params;
      const result = await this.pool.query(
        `INSERT INTO "PostInteraction" (id, "postId", "userId", kind, content, "createdAt")
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW())
         RETURNING *`,
        [data.postId, data.userId, data.kind, data.content || null]
      );
      return result.rows[0];
    },

    delete: async (params: any) => {
      const { postId, userId, kind } = params.where.postId_userId_kind;
      await this.pool.query(
        `DELETE FROM "PostInteraction" WHERE "postId" = $1 AND "userId" = $2 AND kind = $3`,
        [postId, userId, kind]
      );
      return {};
    },

    findMany: async (params: any = {}) => {
      const postId = params.where?.postId;
      let query = `
        SELECT pi.*, 
               json_build_object('id', u.id, 'handle', u.handle, 'name', u.name, 'image', u.image) as user
        FROM "PostInteraction" pi
        LEFT JOIN "User" u ON pi."userId" = u.id
      `;
      const queryParams: any[] = [];
      
      if (postId) {
        query += ` WHERE pi."postId" = $1`;
        queryParams.push(postId);
      }
      
      query += ` ORDER BY pi."createdAt" DESC`;
      
      const result = await this.pool.query(query, queryParams);
      return result.rows;
    },

    count: async (params: any = {}) => {
      const { where } = params;
      let query = `SELECT COUNT(*) as count FROM "PostInteraction"`;
      const queryParams: any[] = [];
      
      if (where) {
        const conditions: string[] = [];
        let paramIndex = 1;
        
        if (where.postId) {
          conditions.push(`"postId" = $${paramIndex++}`);
          queryParams.push(where.postId);
        }
        if (where.kind) {
          conditions.push(`kind = $${paramIndex++}`);
          queryParams.push(where.kind);
        }
        
        if (conditions.length > 0) {
          query += ` WHERE ${conditions.join(' AND ')}`;
        }
      }
      
      const result = await this.pool.query(query, queryParams);
      return parseInt(result.rows[0].count);
    },
  };

  // Project methods
  project = {
    findUnique: async (params: any) => {
      const result = await this.pool.query(
        `SELECT * FROM "Project" WHERE id = $1`,
        [params.where.id]
      );
      return result.rows[0] || null;
    },

    findMany: async (params: any = {}) => {
      const result = await this.pool.query(`SELECT * FROM "Project" ORDER BY "createdAt" DESC`);
      return result.rows;
    },

    create: async (params: any) => {
      const { data } = params;
      const result = await this.pool.query(
        `INSERT INTO "Project" (id, title, summary, "githubUrl", tags, "ownerId", "createdAt", "updatedAt")
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING *`,
        [data.title, data.summary, data.githubUrl, data.tags || [], data.ownerId]
      );
      return result.rows[0];
    },
  };

  // User methods
  user = {
    findUnique: async (params: any) => {
      const where = params.where;
      let query = `SELECT * FROM "User" WHERE `;
      let value;
      
      if (where.id) {
        query += `id = $1`;
        value = where.id;
      } else if (where.email) {
        query += `email = $1`;
        value = where.email;
      } else if (where.handle) {
        query += `handle = $1`;
        value = where.handle;
      }
      
      const result = await this.pool.query(query, [value]);
      return result.rows[0] || null;
    },

    create: async (params: any) => {
      const { data } = params;
      const result = await this.pool.query(
        `INSERT INTO "User" (id, handle, email, name, image, "githubId", "createdAt", "updatedAt")
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING *`,
        [data.handle, data.email, data.name, data.image, data.githubId]
      );
      return result.rows[0];
    },
  };

  // Jam methods
  jam = {
    create: async (params: any) => {
      const { data } = params;
      const result = await this.pool.query(
        `INSERT INTO "Jam" (id, "hostId", "roomId", "startedAt")
         VALUES (gen_random_uuid()::text, $1, $2, NOW())
         RETURNING *`,
        [data.hostId, data.roomId]
      );
      return result.rows[0];
    },

    findUnique: async (params: any) => {
      const where = params.where;
      let query = `
        SELECT j.*, 
               json_build_object('id', u.id, 'handle', u.handle, 'name', u.name, 'image', u.image) as host
        FROM "Jam" j
        LEFT JOIN "User" u ON j."hostId" = u.id
        WHERE `;
      let value;
      
      if (where.id) {
        query += `j.id = $1`;
        value = where.id;
      } else if (where.roomId) {
        query += `j."roomId" = $1`;
        value = where.roomId;
      }
      
      const result = await this.pool.query(query, [value]);
      return result.rows[0] || null;
    },
  };

  // Raw query access
  $queryRaw = async (query: string, ...args: any[]) => {
    const result = await this.pool.query(query, args);
    return result.rows;
  };

  $connect = async () => {
    await this.pool.query('SELECT 1');
  };

  $disconnect = async () => {
    await this.pool.end();
  };
}
