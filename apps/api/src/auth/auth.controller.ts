import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

class GithubAuthDto {
  email: string;
  name?: string;
  image?: string;
  githubId: string;
  handle: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('github')
  async authenticateGithub(@Body() dto: GithubAuthDto) {
    return this.authService.authenticateGithub(dto);
  }
}
