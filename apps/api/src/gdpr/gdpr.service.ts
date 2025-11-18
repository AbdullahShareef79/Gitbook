import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GdprService {
  constructor(private prisma: PrismaService) {}

  async exportUserData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        posts: true,
        projects: true,
        jamsHosted: true,
        follows: true,
        followers: true,
        transactions: true,
        sales: true,
      },
    });

    return {
      user,
      exportedAt: new Date().toISOString(),
    };
  }

  async eraseUserData(userId: string) {
    // Soft delete by anonymizing data
    // In production, implement proper deletion queue/background job
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: `deleted_${userId}@deleted.com`,
        name: '[Deleted User]',
        handle: `deleted_${userId}`,
        image: null,
        githubId: null,
        headline: null,
        skills: [],
      },
    });

    return { message: 'User data marked for deletion' };
  }
}
