import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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
}
