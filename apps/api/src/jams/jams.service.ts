import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';
import { Pool } from 'pg';

@Injectable()
export class JamsService {
  private pool: Pool;
  
  constructor(private prisma: PrismaService) {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async createJam(hostId: string) {
    const roomId = randomBytes(16).toString('hex');
    
    return this.prisma.jam.create({
      data: {
        hostId,
        roomId,
      },
    });
  }

  async getJam(id: string) {
    return this.prisma.jam.findUnique({
      where: { id },
      include: { host: true },
    });
  }

  async getJamByRoomId(roomId: string) {
    return this.prisma.jam.findUnique({
      where: { roomId },
      include: { host: true },
    });
  }

  async saveSnapshot(jamId: string, base64Update: string): Promise<void> {
    const id = randomBytes(16).toString('hex');
    const stateBuffer = Buffer.from(base64Update, 'base64');
    
    await this.pool.query(
      'INSERT INTO jam_snapshots (id, jam_id, state, created_at) VALUES ($1, $2, $3, NOW())',
      [id, jamId, stateBuffer]
    );
  }

  async latestSnapshot(jamId: string): Promise<string | null> {
    const result = await this.pool.query(
      'SELECT state FROM jam_snapshots WHERE jam_id = $1 ORDER BY created_at DESC LIMIT 1',
      [jamId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const stateBuffer = result.rows[0].state as Buffer;
    return stateBuffer.toString('base64');
  }
}
