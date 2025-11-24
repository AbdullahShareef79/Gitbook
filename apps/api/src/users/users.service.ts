import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EventsService } from '../common/events.service';
import { encodeCursor, decodeCursor } from '../common/pagination';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private events: EventsService
  ) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByHandle(handle: string) {
    return this.prisma.user.findUnique({ where: { handle } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(data: {
    email: string;
    handle: string;
    name?: string;
    image?: string;
    githubId?: string;
  }) {
    return this.prisma.user.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async getProfile(handle: string) {
    return this.prisma.user.findUnique({
      where: { handle },
      include: {
        projects: true,
        posts: { take: 10, orderBy: { createdAt: 'desc' } },
        _count: {
          select: { followers: true, follows: true },
        },
      },
    });
  }

  async follow(followerId: string, followeeId: string) {
    if (followerId === followeeId) {
      throw new Error('Cannot follow yourself');
    }

    const follow = await this.prisma.follow.create({
      data: { followerId, followeeId },
    });

    // Create notification
    await this.notifications.create({
      userId: followeeId,
      type: 'FOLLOW',
      refId: followerId,
      meta: {},
    });

    // Log event
    await this.events.log(followerId, 'follow', { followeeId });

    return { success: true, follow };
  }

  async unfollow(followerId: string, followeeId: string) {
    const follow = await this.prisma.follow.delete({
      where: {
        followerId_followeeId: { followerId, followeeId },
      },
    });

    // Log event
    await this.events.log(followerId, 'unfollow', { followeeId });

    return { success: true };
  }

  async getFollowers(userId: string, cursor?: string, limit = 20) {
    let query = `
      SELECT f.*, 
             json_build_object(
               'id', u.id,
               'handle', u.handle,
               'name', u.name,
               'image', u.image
             ) as follower
      FROM "Follow" f
      JOIN "User" u ON f."followerId" = u.id
      WHERE f."followeeId" = $1
    `;
    const values: any[] = [userId];

    if (cursor) {
      const { createdAt, id } = decodeCursor(cursor);
      query += ` AND (f."createdAt", f.id) < ($2, $3)`;
      values.push(createdAt, id);
    }

    query += ` ORDER BY f."createdAt" DESC, f.id DESC LIMIT $${values.length + 1}`;
    values.push(limit + 1);

    const result = await this.prisma.pool.query(query, values);
    const hasMore = result.rows.length > limit;
    const items = hasMore ? result.rows.slice(0, limit) : result.rows;

    return {
      items: items.map(row => row.follower),
      nextCursor: hasMore
        ? encodeCursor({ createdAt: items[items.length - 1].createdAt, id: items[items.length - 1].id })
        : null,
    };
  }

  async getFollowing(userId: string, cursor?: string, limit = 20) {
    let query = `
      SELECT f.*, 
             json_build_object(
               'id', u.id,
               'handle', u.handle,
               'name', u.name,
               'image', u.image
             ) as followee
      FROM "Follow" f
      JOIN "User" u ON f."followeeId" = u.id
      WHERE f."followerId" = $1
    `;
    const values: any[] = [userId];

    if (cursor) {
      const { createdAt, id } = decodeCursor(cursor);
      query += ` AND (f."createdAt", f.id) < ($2, $3)`;
      values.push(createdAt, id);
    }

    query += ` ORDER BY f."createdAt" DESC, f.id DESC LIMIT $${values.length + 1}`;
    values.push(limit + 1);

    const result = await this.prisma.pool.query(query, values);
    const hasMore = result.rows.length > limit;
    const items = hasMore ? result.rows.slice(0, limit) : result.rows;

    return {
      items: items.map(row => row.followee),
      nextCursor: hasMore
        ? encodeCursor({ createdAt: items[items.length - 1].createdAt, id: items[items.length - 1].id })
        : null,
    };
  }

  async getBookmarks(userId: string, cursor?: string, limit = 20) {
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
             ) as project,
             pi."createdAt" as "bookmarkedAt"
      FROM "PostInteraction" pi
      JOIN "Post" p ON pi."postId" = p.id
      LEFT JOIN "User" u ON p."authorId" = u.id
      LEFT JOIN "Project" pr ON (p.content->>'projectId')::text = pr.id
      WHERE pi."userId" = $1 AND pi.kind = 'BOOKMARK'
    `;
    const values: any[] = [userId];

    if (cursor) {
      const { createdAt, id } = decodeCursor(cursor);
      query += ` AND (pi."createdAt", pi.id) < ($2, $3)`;
      values.push(createdAt, id);
    }

    query += ` ORDER BY pi."createdAt" DESC, pi.id DESC LIMIT $${values.length + 1}`;
    values.push(limit + 1);

    const result = await this.prisma.pool.query(query, values);
    const hasMore = result.rows.length > limit;
    const items = hasMore ? result.rows.slice(0, limit) : result.rows;

    return {
      items: items.map(row => ({
        ...row,
        content: typeof row.content === 'string' ? JSON.parse(row.content) : row.content,
      })),
      nextCursor: hasMore
        ? encodeCursor({ createdAt: items[items.length - 1].createdAt, id: items[items.length - 1].id })
        : null,
    };
  }

  async getRecommendations(userId: string, limit = 10) {
    // Get user's current follows and skills
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        follows: {
          select: { followeeId: true },
        },
      },
    });

    if (!currentUser) {
      return { users: [] };
    }

    const followingIds = currentUser.follows.map(f => f.followeeId);
    const userSkills = currentUser.skills || [];

    // Find users with similar skills who are followed by people you follow
    const recommendations = await this.prisma.user.findMany({
      where: {
        AND: [
          { id: { not: userId } }, // Not self
          { id: { notIn: followingIds } }, // Not already following
          {
            OR: [
              // Users followed by your follows (friend-of-friend)
              {
                followers: {
                  some: {
                    followerId: { in: followingIds },
                  },
                },
              },
              // Users with similar skills
              userSkills.length > 0
                ? {
                    skills: {
                      hasSome: userSkills,
                    },
                  }
                : {},
            ],
          },
        ],
      },
      select: {
        id: true,
        handle: true,
        name: true,
        image: true,
        headline: true,
        skills: true,
        _count: {
          select: {
            followers: true,
            posts: true,
          },
        },
      },
      take: limit * 2, // Get more for scoring
    });

    // Score and sort recommendations
    const scored = recommendations.map(user => {
      let score = 0;

      // Points for mutual skills
      const mutualSkills = user.skills.filter(s => userSkills.includes(s));
      score += mutualSkills.length * 3;

      // Points for followers (popularity)
      score += Math.log(user._count.followers + 1);

      // Points for activity
      score += Math.log(user._count.posts + 1) * 0.5;

      return {
        ...user,
        mutualSkills,
        score,
      };
    });

    // Sort by score and return top N
    const topRecommendations = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return {
      users: topRecommendations,
    };
  }
}

