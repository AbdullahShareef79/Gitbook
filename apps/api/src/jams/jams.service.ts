import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class JamsService {
  constructor(private prisma: PrismaService) {}

  async createJam(hostId: string, templateId?: string) {
    const roomId = randomBytes(16).toString('hex');
    
    const jam = await this.prisma.jam.create({
      data: {
        hostId,
        roomId,
      },
    });

    // If template provided, prefill snapshot with starter code
    if (templateId) {
      const result = await this.prisma.pool.query(
        `SELECT starter_code FROM "JamTemplate" WHERE id = $1`,
        [templateId]
      );

      if (result.rows.length > 0 && result.rows[0].starter_code) {
        // Convert starter code to Yjs update format (simplified)
        // In real implementation, you'd use Yjs to create proper update
        const starterCode = result.rows[0].starter_code;
        const base64Update = Buffer.from(starterCode).toString('base64');
        await this.saveSnapshot(jam.id, base64Update);
      }
    }

    return jam;
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
    
    await this.prisma.pool.query(
      'INSERT INTO jam_snapshots (id, jam_id, state, created_at) VALUES ($1, $2, $3, NOW())',
      [id, jamId, stateBuffer]
    );
  }

  async latestSnapshot(jamId: string): Promise<string | null> {
    const result = await this.prisma.pool.query(
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
