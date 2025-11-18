import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('profile/:handle')
  async getProfile(@Param('handle') handle: string) {
    return this.users.getProfile(handle);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req) {
    return this.users.findById(req.user.userId);
  }
}
