import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { PostsModule } from './posts/posts.module';
import { JamsModule } from './jams/jams.module';
import { SearchModule } from './search/search.module';
import { AiModule } from './ai/ai.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { GdprModule } from './gdpr/gdpr.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    PostsModule,
    JamsModule,
    SearchModule,
    AiModule,
    MarketplaceModule,
    GdprModule,
    HealthModule,
  ],
})
export class AppModule {}
