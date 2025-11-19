import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class InviteService {
  constructor(private prisma: PrismaService) {}

  async createInvites(count: number, expiresAt?: Date, createdBy?: string): Promise<string[]> {
    const codes: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const code = randomBytes(8).toString('hex').toUpperCase();
      codes.push(code);
    }

    const values = codes.map(code => ({
      code,
      created_by: createdBy || null,
      expires_at: expiresAt || null,
      is_active: true
    }));

    await this.prisma.pool.query(
      `INSERT INTO "InviteCode" (code, created_by, expires_at, is_active) 
       SELECT * FROM UNNEST($1::text[], $2::text[], $3::timestamptz[], $4::boolean[])`,
      [
        codes,
        values.map(v => v.created_by),
        values.map(v => v.expires_at),
        values.map(v => v.is_active)
      ]
    );

    return codes;
  }

  async claimInvite(code: string, userId: string): Promise<boolean> {
    const result = await this.prisma.pool.query(
      `UPDATE "InviteCode" 
       SET used_by = $2, used_at = NOW()
       WHERE code = $1 
         AND is_active = true 
         AND used_by IS NULL
         AND (expires_at IS NULL OR expires_at > NOW())
       RETURNING code`,
      [code, userId]
    );

    return result.rowCount > 0;
  }

  async validateInviteCode(code: string): Promise<boolean> {
    const result = await this.prisma.pool.query(
      `SELECT 1 FROM "InviteCode" 
       WHERE code = $1 
         AND is_active = true 
         AND used_by IS NULL 
         AND (expires_at IS NULL OR expires_at > NOW())`,
      [code]
    );

    return result.rowCount > 0;
  }

  async getInviteCodes(limit: number = 100): Promise<any[]> {
    const result = await this.prisma.pool.query(
      `SELECT code, created_by, used_by, used_at, expires_at, is_active, created_at
       FROM "InviteCode"
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows;
  }
}
