import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}

  async authenticateGithub(data: {
    email: string;
    name?: string;
    image?: string;
    githubId: string;
    handle: string;
  }) {
    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      // Check if handle is taken
      const existingHandle = await this.prisma.user.findUnique({
        where: { handle: data.handle },
      });

      const handle = existingHandle 
        ? `${data.handle}${Math.floor(Math.random() * 1000)}`
        : data.handle;

      user = await this.prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          image: data.image,
          githubId: data.githubId,
          handle,
        },
      });
    } else {
      // Update user info if changed
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          name: data.name || user.name,
          image: data.image || user.image,
          githubId: data.githubId || user.githubId,
        },
      });
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwt.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        handle: user.handle,
        image: user.image,
      },
    };
  }
}
