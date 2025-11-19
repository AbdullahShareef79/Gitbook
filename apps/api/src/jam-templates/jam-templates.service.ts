import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JamTemplatesService {
  constructor(private prisma: PrismaService) {}

  async getTemplates(): Promise<any[]> {
    const result = await this.prisma.pool.query(
      `SELECT id, title, description, language, starter_code, created_at
       FROM "JamTemplate"
       ORDER BY created_at ASC`
    );

    return result.rows;
  }

  async getTemplateById(id: string): Promise<any | null> {
    const result = await this.prisma.pool.query(
      `SELECT id, title, description, language, starter_code, created_at
       FROM "JamTemplate"
       WHERE id = $1`,
      [id]
    );

    return result.rows[0] || null;
  }

  async createTemplate(title: string, description: string, language: string, starterCode: string): Promise<any> {
    const result = await this.prisma.pool.query(
      `INSERT INTO "JamTemplate" (title, description, language, starter_code, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, title, description, language, starter_code, created_at`,
      [title, description, language, starterCode]
    );

    return result.rows[0];
  }
}
