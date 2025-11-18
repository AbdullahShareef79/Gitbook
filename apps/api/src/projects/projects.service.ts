import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { EmbeddingsService } from '../ai/embeddings.service';
import axios from 'axios';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private ai: AiService,
    private embeddings: EmbeddingsService,
  ) {}

  async createFromGithub(data: { githubUrl: string; userId: string }) {
    // Parse GitHub URL
    const match = data.githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new Error('Invalid GitHub URL');
    }

    const [, owner, repo] = match;
    const repoName = repo.replace(/\.git$/, '');

    // Fetch repo metadata (if GitHub token available)
    let repoData: any = {
      name: repoName,
      description: '',
      topics: [],
    };

    try {
      const response = await axios.get(`https://api.github.com/repos/${owner}/${repoName}`, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          ...(process.env.GITHUB_TOKEN && {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
          }),
        },
      });

      repoData = {
        name: response.data.name,
        description: response.data.description || '',
        topics: response.data.topics || [],
      };
    } catch (error) {
      console.warn('Could not fetch GitHub metadata:', error.message);
    }

    // Generate AI summary
    const summary = await this.ai.summarizeRepo(repoData);

    // Create project
    const project = await this.prisma.project.create({
      data: {
        title: repoData.name,
        githubUrl: data.githubUrl,
        tags: repoData.topics,
        summary: summary.join('\n'),
        ownerId: data.userId,
      },
    });

    // Generate and store embedding (async, don't block)
    this.generateAndStoreEmbedding(project.id, {
      title: project.title,
      summary: project.summary,
      tags: project.tags,
    }).catch((err) => console.error('Embedding generation failed:', err));

    return project;
  }

  private async generateAndStoreEmbedding(
    projectId: string,
    data: { title: string; summary?: string; tags: string[] },
  ) {
    const embedding = await this.embeddings.generateProjectEmbedding(data);
    if (embedding) {
      await this.prisma.$executeRaw`
        INSERT INTO "Embedding" ("projectId", "vector")
        VALUES (${projectId}, ${JSON.stringify(embedding)}::vector)
        ON CONFLICT ("projectId") DO UPDATE SET "vector" = ${JSON.stringify(embedding)}::vector
      `;
    }
  }

  async findById(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: { owner: true },
    });
  }

  async findByOwner(ownerId: string) {
    return this.prisma.project.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
