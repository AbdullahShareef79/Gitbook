import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private projects: ProjectsService,
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

  async getFeed(userId?: string, limit = 20) {
    // Simple feed: recent posts + posts from followed users
    const posts = await this.prisma.post.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, handle: true, name: true, image: true },
        },
      },
    });

    return posts;
  }

  async getPostById(id: string) {
    return this.prisma.post.findUnique({
      where: { id },
      include: { author: true },
    });
  }

  // Interaction methods
  async addInteraction(postId: string, userId: string, kind: 'LIKE' | 'BOOKMARK' | 'COMMENT', content?: string) {
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
        content: kind === 'COMMENT' ? content : null,
      },
      include: {
        user: {
          select: { id: true, handle: true, name: true, image: true },
        },
      },
    });

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
