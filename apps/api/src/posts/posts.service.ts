import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EventsService } from '../common/events.service';
import { encodeCursor, decodeCursor } from '../common/pagination';
import { SAFE } from '../common/sanitize';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private projects: ProjectsService,
    private notifications: NotificationsService,
    private events: EventsService,
  ) {}

  async createRepoCard(data: { projectId: string; authorId: string }) {
    const project = await this.projects.findById(data.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    return this.prisma.post.create({
      data: {
        type: 'REPO_CARD',
        authorId: data.authorId,
        content: {
          projectId: project.id,
          title: project.title,
          summary: project.summary?.split('\n') || [],
          githubUrl: project.githubUrl,
          tags: project.tags,
        },
      },
    });
  }

  async getFeed(cursor?: string, limit = 20) {
    const decodedCursor = decodeCursor(cursor);
    
    let query = `
      SELECT 
        p.*,
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
        ) as project,
        -- Compute ranking score
        (
          0.6 * (1.0 / (1.0 + EXTRACT(EPOCH FROM (now() - p."createdAt"))/3600.0))
          + 0.4 * (
            (
              COALESCE((SELECT COUNT(*) FROM "PostInteraction" WHERE "postId" = p.id AND kind = 'LIKE'), 0) * 2 +
              COALESCE((SELECT COUNT(*) FROM "PostInteraction" WHERE "postId" = p.id AND kind = 'COMMENT'), 0) * 3 +
              COALESCE((SELECT COUNT(*) FROM "PostInteraction" WHERE "postId" = p.id AND kind = 'BOOKMARK'), 0)
            ) / 10.0
          )
        ) as rank_score
      FROM "Post" p
      LEFT JOIN "User" u ON p."authorId" = u.id
      LEFT JOIN "Project" pr ON (p.content->>'projectId')::text = pr.id
    `;

    const params: any[] = [];
    
    if (decodedCursor) {
      query += ` WHERE (p."createdAt", p.id) < ($1::timestamptz, $2)`;
      params.push(decodedCursor.createdAt, decodedCursor.id);
    }

    query += ` ORDER BY p."createdAt" DESC, p.id DESC LIMIT $${params.length + 1}`;
    params.push(limit + 1); // Fetch one extra to determine if there's a next page

    const result = await this.prisma.pool.query(query, params);
    const rows = result.rows;

    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit).map(row => ({
      ...row,
      content: typeof row.content === 'string' ? JSON.parse(row.content) : row.content,
    }));

    let nextCursor: string | undefined;
    if (hasMore && items.length > 0) {
      const lastItem = items[items.length - 1];
      nextCursor = encodeCursor({
        createdAt: lastItem.createdAt,
        id: lastItem.id,
      });
    }

    return {
      items,
      nextCursor,
    };
  }

  async getPostById(id: string) {
    return this.prisma.post.findUnique({
      where: { id },
      include: { author: true },
    });
  }

  // Interaction methods
  async addInteraction(postId: string, userId: string, kind: 'LIKE' | 'BOOKMARK' | 'COMMENT', content?: string) {
    // Sanitize comment content
    let sanitizedContent: string | null = null;
    if (kind === 'COMMENT' && content) {
      sanitizedContent = SAFE(content);
    }

    // Get post to find author
    const post = await this.getPostById(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    // For LIKE and BOOKMARK, use upsert to toggle
    if (kind === 'LIKE' || kind === 'BOOKMARK') {
      const existing = await this.prisma.postInteraction.findUnique({
        where: {
          postId_userId_kind: { postId, userId, kind },
        },
      });

      if (existing) {
        // Already exists, delete to toggle off
        await this.prisma.postInteraction.delete({
          where: { id: existing.id },
        });
        return { action: 'removed', kind };
      }
    }

    // Create new interaction
    const interaction = await this.prisma.postInteraction.create({
      data: {
        postId,
        userId,
        kind,
        content: sanitizedContent,
      },
      include: {
        user: {
          select: { id: true, handle: true, name: true, image: true },
        },
      },
    });

    // Emit notification to post author (skip if self)
    if (post.authorId && post.authorId !== userId) {
      await this.notifications.create({
        userId: post.authorId,
        type: kind,
        refId: postId,
        meta: {
          actorId: userId,
          actorHandle: interaction.user?.handle,
          content: kind === 'COMMENT' ? content : undefined,
        },
      });
    }

    // Log analytics event
    await this.events.log(userId, kind.toLowerCase(), { postId });

    return { action: 'added', kind, interaction };
  }

  async deleteInteraction(postId: string, userId: string, kind: 'LIKE' | 'BOOKMARK' | 'COMMENT') {
    const interaction = await this.prisma.postInteraction.findUnique({
      where: {
        postId_userId_kind: { postId, userId, kind },
      },
    });

    if (!interaction) {
      throw new Error('Interaction not found');
    }

    await this.prisma.postInteraction.delete({
      where: { id: interaction.id },
    });

    return { success: true, kind };
  }

  async getPostInteractions(postId: string, userId?: string) {
    const interactions = await this.prisma.postInteraction.findMany({
      where: { postId },
      include: {
        user: {
          select: { id: true, handle: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Count by kind
    const counts = {
      LIKE: interactions.filter(i => i.kind === 'LIKE').length,
      BOOKMARK: interactions.filter(i => i.kind === 'BOOKMARK').length,
      COMMENT: interactions.filter(i => i.kind === 'COMMENT').length,
    };

    // Check if current user has interacted
    const userInteractions = userId
      ? interactions.filter(i => i.userId === userId).map(i => i.kind)
      : [];

    return {
      counts,
      userInteracted: {
        liked: userInteractions.includes('LIKE'),
        bookmarked: userInteractions.includes('BOOKMARK'),
      },
      comments: interactions.filter(i => i.kind === 'COMMENT'),
    };
  }
}
