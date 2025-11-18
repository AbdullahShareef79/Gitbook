import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { IsString } from 'class-validator';

class CreateProjectDto {
  @IsString()
  githubUrl: string;
}

@Controller('projects')
export class ProjectsController {
  constructor(private projects: ProjectsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('from-github')
  async createFromGithub(@Body() dto: CreateProjectDto, @Request() req) {
    return this.projects.createFromGithub({
      githubUrl: dto.githubUrl,
      userId: req.user.userId,
    });
  }

  @Get(':id')
  async getProject(@Param('id') id: string) {
    return this.projects.findById(id);
  }
}
