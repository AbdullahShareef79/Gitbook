import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MentionsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  // Extract @mentions from text content
  extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]); // Extract handle without @
    }

    return [...new Set(mentions)]; // Remove duplicates
  }

  // Create mentions for a post
  async createPostMentions(postId: string, content: string, createdById: string) {
    const handles = this.extractMentions(content);

    if (handles.length === 0) {
      return [];
    }

    // Find users by handles
    const users = await this.prisma.user.findMany({
      where: {
        handle: { in: handles },
        id: { not: createdById }, // Don't mention self
      },
      select: { id: true, handle: true },
    });

    // Create mention records
    const mentions = await Promise.all(
      users.map(async (user) => {
        const mention = await this.prisma.mention.create({
          data: {
            postId,
            mentionedUserId: user.id,
            createdById,
          },
        });

        // Send notification
        await this.notifications.create({
          userId: user.id,
          type: 'mention',
          refId: postId,
          meta: { createdById, postId },
        });

        return mention;
      })
    );

    return mentions;
  }

  // Create mentions for a comment
  async createCommentMentions(
    commentId: string,
    postId: string,
    content: string,
    createdById: string,
  ) {
    const handles = this.extractMentions(content);

    if (handles.length === 0) {
      return [];
    }

    // Find users by handles
    const users = await this.prisma.user.findMany({
      where: {
        handle: { in: handles },
        id: { not: createdById },
      },
      select: { id: true, handle: true },
    });

    // Create mention records
    const mentions = await Promise.all(
      users.map(async (user) => {
        const mention = await this.prisma.mention.create({
          data: {
            commentId,
            mentionedUserId: user.id,
            createdById,
          },
        });

        // Send notification
        await this.notifications.create({
          userId: user.id,
          type: 'mention',
          refId: commentId,
          meta: { createdById, postId, commentId },
        });

        return mention;
      })
    );

    return mentions;
  }

  // Get mentions for a user
  async getUserMentions(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const mentions = await this.prisma.mention.findMany({
      where: { mentionedUserId: userId },
      include: {
        post: {
          include: {
            author: {
              select: {
                id: true,
                handle: true,
                name: true,
                image: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            handle: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    return {
      mentions,
      hasMore: mentions.length === limit,
      page,
    };
  }

  // Search users for mentions (autocomplete)
  async searchUsersForMention(query: string, limit = 10) {
    if (!query || query.length < 2) {
      return { users: [] };
    }

    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { handle: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        handle: true,
        name: true,
        image: true,
        headline: true,
      },
      take: limit,
    });

    return { users };
  }
}
