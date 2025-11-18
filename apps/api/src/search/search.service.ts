import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SearchService {
  private pool: Pool;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.pool = new Pool({ connectionString: config.get('DATABASE_URL') });
  }

  async searchProjects(query: string, limit = 10) {
    // Simple text search for now
    const projects = await this.prisma.project.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { summary: { contains: query, mode: 'insensitive' } },
          { tags: { has: query.toLowerCase() } },
        ],
      },
      take: limit,
      include: { owner: true },
    });

    return projects;
  }

  async similarProjects(embedding: number[], limit = 10) {
    const res = await this.pool.query(
      `SELECT "Project".id, "Project".title, 1 - ("Embedding".vector <=> $1::vector) AS score
       FROM "Embedding"
       JOIN "Project" ON "Project".id = "Embedding"."projectId"
       ORDER BY "Embedding".vector <=> $1::vector
       LIMIT $2`,
      [JSON.stringify(embedding), limit],
    );
    return res.rows;
  }
}
