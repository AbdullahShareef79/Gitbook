import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public pool: Pool;

  constructor() {
    // Parse the DATABASE_URL to avoid SASL issues
    const dbUrl = process.env.DATABASE_URL || 'postgresql://dev:dev@localhost:5432/devsocial';
    this.pool = new Pool({
      connectionString: dbUrl,
      ssl: false,
    });
  }

  async onModuleInit() {
    // Test connection with timeout
    try {
      const result = await this.pool.query('SELECT 1');
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      // Don't throw - let the app start anyway
    }
  }

  async onModuleDestroy() {
    try {
      await this.pool.end();
    } catch (error) {
      console.error('Error closing pool:', error.message);
    }
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

    findMany: async (params: any = {}) => {
      let query = `SELECT * FROM "User" WHERE TRUE`;
      const values: any[] = [];
      let paramIndex = 1;

      if (params.where) {
        if (params.where.handle?.contains) {
          query += ` AND handle ILIKE $${paramIndex++}`;
          values.push(`%${params.where.handle.contains}%`);
        }
        if (params.where.id?.in) {
          query += ` AND id = ANY($${paramIndex++})`;
          values.push(params.where.id.in);
        }
        if (params.where.id?.notIn) {
          query += ` AND id != ALL($${paramIndex++})`;
          values.push(params.where.id.notIn);
        }
      }

      if (params.take) {
        query += ` LIMIT ${params.take}`;
      }

      const result = await this.pool.query(query, values);
      return result.rows;
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

    update: async (params: any) => {
      const { where, data } = params;
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (data.name !== undefined) {
        fields.push(`name = $${paramIndex++}`);
        values.push(data.name);
      }
      if (data.image !== undefined) {
        fields.push(`image = $${paramIndex++}`);
        values.push(data.image);
      }
      if (data.headline !== undefined) {
        fields.push(`headline = $${paramIndex++}`);
        values.push(data.headline);
      }
      if (data.skills !== undefined) {
        fields.push(`skills = $${paramIndex++}`);
        values.push(data.skills);
      }

      fields.push(`"updatedAt" = NOW()`);
      values.push(where.id);

      const result = await this.pool.query(
        `UPDATE "User" SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
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

  $executeRaw = async (strings: TemplateStringsArray | string, ...args: any[]) => {
    // Handle tagged template literals
    let query: string;
    if (typeof strings === 'string') {
      query = strings;
    } else {
      // Combine template strings and args
      query = strings.reduce((acc, str, i) => {
        return acc + str + (args[i] !== undefined ? `$${i + 1}` : '');
      }, '');
    }
    const result = await this.pool.query(query, args);
    return result.rowCount || 0;
  };

  // Marketplace methods
  marketplaceItem = {
    findMany: async (params: any = {}) => {
      const limit = params.take || 20;
      const result = await this.pool.query(
        `SELECT 
          m.*,
          json_build_object(
            'id', u.id,
            'handle', u.handle,
            'name', u.name,
            'image', u.image
          ) as seller
         FROM "MarketplaceItem" m
         LEFT JOIN "User" u ON m."sellerId" = u.id
         ORDER BY m."createdAt" DESC
         LIMIT $1`,
        [limit]
      );
      return result.rows.map(row => ({
        ...row,
        seller: row.seller
      }));
    },

    findUnique: async (params: any) => {
      const { where } = params;
      const result = await this.pool.query(
        `SELECT 
          m.*,
          json_build_object(
            'id', u.id,
            'handle', u.handle,
            'name', u.name,
            'image', u.image
          ) as seller
         FROM "MarketplaceItem" m
         LEFT JOIN "User" u ON m."sellerId" = u.id
         WHERE m.id = $1`,
        [where.id]
      );
      return result.rows[0] || null;
    },

    create: async (params: any) => {
      const { data } = params;
      const result = await this.pool.query(
        `INSERT INTO "MarketplaceItem" 
          (id, "sellerId", title, description, type, "priceCents", tags, "previewUrl", "downloadUrl", "createdAt", "updatedAt") 
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) 
         RETURNING *`,
        [
          data.sellerId,
          data.title,
          data.description,
          data.type,
          data.priceCents,
          data.tags || [],
          data.previewUrl || null,
          data.downloadUrl || null,
        ]
      );
      return result.rows[0];
    },
  };

  // Follow methods
  follow = {
    create: async (params: any) => {
      const { data } = params;
      const result = await this.pool.query(
        `INSERT INTO "Follow" (id, "followerId", "followeeId", "createdAt")
         VALUES (gen_random_uuid()::text, $1, $2, NOW())
         ON CONFLICT ("followerId", "followeeId") DO NOTHING
         RETURNING *`,
        [data.followerId, data.followeeId]
      );
      return result.rows[0];
    },

    delete: async (params: any) => {
      const { where } = params;
      const result = await this.pool.query(
        `DELETE FROM "Follow"
         WHERE "followerId" = $1 AND "followeeId" = $2
         RETURNING *`,
        [where.followerId_followeeId.followerId, where.followerId_followeeId.followeeId]
      );
      return result.rows[0];
    },

    findMany: async (params: any = {}) => {
      const { where, orderBy, take = 20 } = params;
      let query = `SELECT f.*, 
                          json_build_object(
                            'id', u.id,
                            'handle', u.handle,
                            'name', u.name,
                            'image', u.image
                          ) as user
                   FROM "Follow" f
                   LEFT JOIN "User" u ON `;
      
      let values: any[] = [];
      let whereClause = '';
      
      if (where?.followerId) {
        query += `f."followeeId" = u.id WHERE f."followerId" = $1`;
        values.push(where.followerId);
        whereClause = 'followerId';
      } else if (where?.followeeId) {
        query += `f."followerId" = u.id WHERE f."followeeId" = $1`;
        values.push(where.followeeId);
        whereClause = 'followeeId';
      }

      query += ` ORDER BY f."createdAt" DESC LIMIT $${values.length + 1}`;
      values.push(take);

      const result = await this.pool.query(query, values);
      return result.rows;
    },

    count: async (params: any = {}) => {
      const { where } = params;
      let query = `SELECT COUNT(*) as count FROM "Follow" WHERE `;
      let values: any[] = [];

      if (where?.followerId) {
        query += `"followerId" = $1`;
        values.push(where.followerId);
      } else if (where?.followeeId) {
        query += `"followeeId" = $1`;
        values.push(where.followeeId);
      } else {
        query += `TRUE`;
      }

      const result = await this.pool.query(query, values);
      return parseInt(result.rows[0].count, 10);
    },
  };

  // Conversation methods
  conversation = {
    findMany: async (params: any = {}) => {
      const result = await this.pool.query(
        `SELECT c.*, 
          json_agg(DISTINCT jsonb_build_object('id', cp.id, 'userId', cp."userId", 'lastReadAt', cp."lastReadAt")) as participants,
          (SELECT json_build_object('id', m.id, 'content', m.content, 'senderId', m."senderId", 'createdAt', m."createdAt")
           FROM "Message" m WHERE m."conversationId" = c.id ORDER BY m."createdAt" DESC LIMIT 1) as "lastMessage"
         FROM "Conversation" c
         LEFT JOIN "ConversationParticipant" cp ON c.id = cp."conversationId"
         WHERE cp."userId" = $1
         GROUP BY c.id
         ORDER BY c."updatedAt" DESC`,
        [params.where?.participants?.some?.userId || '']
      );
      return result.rows;
    },
    findFirst: async (params: any) => {
      const result = await this.pool.query(
        `SELECT c.* FROM "Conversation" c
         INNER JOIN "ConversationParticipant" cp1 ON c.id = cp1."conversationId"
         INNER JOIN "ConversationParticipant" cp2 ON c.id = cp2."conversationId"
         WHERE cp1."userId" = $1 AND cp2."userId" = $2 AND c."isGroup" = false
         LIMIT 1`,
        [params.where?.participants?.every?.[0]?.userId, params.where?.participants?.every?.[1]?.userId]
      );
      return result.rows[0] || null;
    },
    create: async (params: any) => {
      const { data } = params;
      const result = await this.pool.query(
        `INSERT INTO "Conversation" (id, "isGroup", name, "createdAt", "updatedAt")
         VALUES (gen_random_uuid()::text, $1, $2, NOW(), NOW())
         RETURNING *`,
        [data.isGroup || false, data.name || null]
      );
      return result.rows[0];
    },
    update: async (params: any) => {
      await this.pool.query(
        `UPDATE "Conversation" SET "updatedAt" = NOW() WHERE id = $1`,
        [params.where.id]
      );
    },
  };

  // ConversationParticipant methods
  conversationParticipant = {
    findFirst: async (params: any) => {
      const result = await this.pool.query(
        `SELECT * FROM "ConversationParticipant"
         WHERE "conversationId" = $1 AND "userId" = $2 LIMIT 1`,
        [params.where.conversationId, params.where.userId]
      );
      return result.rows[0] || null;
    },
    findMany: async (params: any) => {
      const result = await this.pool.query(
        `SELECT cp.*, json_build_object('id', u.id, 'handle', u.handle, 'name', u.name, 'image', u.image) as user
         FROM "ConversationParticipant" cp
         INNER JOIN "User" u ON cp."userId" = u.id
         WHERE cp."conversationId" = $1 AND cp."userId" != $2`,
        [params.where.conversationId, params.where.userId?.not || '']
      );
      return result.rows;
    },
    create: async (params: any) => {
      const { data } = params;
      const result = await this.pool.query(
        `INSERT INTO "ConversationParticipant" (id, "conversationId", "userId", "joinedAt")
         VALUES (gen_random_uuid()::text, $1, $2, NOW())
         RETURNING *`,
        [data.conversationId, data.userId]
      );
      return result.rows[0];
    },
  };

  // Message methods
  message = {
    findMany: async (params: any = {}) => {
      let query = `SELECT m.*, json_build_object('id', u.id, 'handle', u.handle, 'name', u.name, 'image', u.image) as sender
                   FROM "Message" m
                   INNER JOIN "User" u ON m."senderId" = u.id
                   WHERE m."conversationId" = $1 AND m."isDeleted" = false`;
      const values = [params.where?.conversationId];
      
      if (params.cursor) {
        query += ` AND m."createdAt" < (SELECT "createdAt" FROM "Message" WHERE id = $2)`;
        values.push(params.cursor);
      }
      
      query += ` ORDER BY m."createdAt" DESC LIMIT ${params.take || 50}`;
      
      const result = await this.pool.query(query, values);
      return result.rows.reverse();
    },
    create: async (params: any) => {
      const { data } = params;
      const result = await this.pool.query(
        `INSERT INTO "Message" (id, "conversationId", "senderId", content, type, metadata, "createdAt", "updatedAt")
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING *`,
        [data.conversationId, data.senderId, data.content, data.type || 'TEXT', data.metadata ? JSON.stringify(data.metadata) : null]
      );
      return result.rows[0];
    },
    findUnique: async (params: any) => {
      const result = await this.pool.query(
        `SELECT m.*, json_build_object('id', u.id, 'handle', u.handle, 'name', u.name, 'image', u.image) as sender
         FROM "Message" m
         INNER JOIN "User" u ON m."senderId" = u.id
         WHERE m.id = $1`,
        [params.where.id]
      );
      return result.rows[0] || null;
    },
    delete: async (params: any) => {
      await this.pool.query(
        `UPDATE "Message" SET "isDeleted" = true WHERE id = $1`,
        [params.where.id]
      );
    },
    updateMany: async (params: any) => {
      if (params.where?.conversationId && params.data?.isRead !== undefined) {
        // Mark messages as read - this is a placeholder, adjust based on your schema
        await this.pool.query(
          `UPDATE "ConversationParticipant" SET "lastReadAt" = NOW()
           WHERE "conversationId" = $1 AND "userId" = $2`,
          [params.where.conversationId, params.where.senderId?.not]
        );
      }
    },
    count: async (params: any) => {
      const result = await this.pool.query(
        `SELECT COUNT(*) FROM "Message"
         WHERE "conversationId" = $1 AND "senderId" = $2 AND "isDeleted" = false
         AND "createdAt" > COALESCE(
           (SELECT "lastReadAt" FROM "ConversationParticipant" 
            WHERE "conversationId" = $1 AND "userId" != $2 LIMIT 1),
           '1970-01-01'
         )`,
        [params.where.conversationId, params.where.senderId]
      );
      return parseInt(result.rows[0].count, 10);
    },
  };

  // Mention methods
  mention = {
    create: async (params: any) => {
      const { data } = params;
      const result = await this.pool.query(
        `INSERT INTO "Mention" (id, "postId", "commentId", "mentionedUserId", "createdById", "createdAt")
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW())
         RETURNING *`,
        [data.postId || null, data.commentId || null, data.mentionedUserId, data.createdById]
      );
      return result.rows[0];
    },
    findMany: async (params: any = {}) => {
      let query = `SELECT m.*, 
                    json_build_object('id', u.id, 'handle', u.handle, 'name', u.name, 'image', u.image) as "mentionedUser",
                    json_build_object('id', cu.id, 'handle', cu.handle, 'name', cu.name, 'image', cu.image) as "createdBy"`;
      
      if (params.include?.post) {
        query += `, json_build_object('id', p.id, 'content', p.content) as post`;
      }
      
      query += ` FROM "Mention" m
                 INNER JOIN "User" u ON m."mentionedUserId" = u.id
                 INNER JOIN "User" cu ON m."createdById" = cu.id`;
      
      if (params.include?.post) {
        query += ` LEFT JOIN "Post" p ON m."postId" = p.id`;
      }
      
      const values = [];
      if (params.where?.mentionedUserId) {
        query += ` WHERE m."mentionedUserId" = $1`;
        values.push(params.where.mentionedUserId);
      }
      
      query += ` ORDER BY m."createdAt" DESC`;
      
      if (params.take) {
        query += ` LIMIT ${params.take}`;
      }
      
      const result = await this.pool.query(query, values);
      return result.rows;
    },
  };

  $connect = async () => {
    await this.pool.query('SELECT 1');
  };

  $disconnect = async () => {
    await this.pool.end();
  };
}
