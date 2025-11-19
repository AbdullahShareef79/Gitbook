import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { InviteService } from './invite.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

class CreateInvitesDto {
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  count?: number = 1;

  @IsString()
  @IsOptional()
  expiresAt?: string;
}

class ClaimInviteDto {
  @IsString()
  code: string;
}

@Controller('auth/invite')
export class InviteController {
  constructor(private inviteService: InviteService) {}

  // Admin-only: create invite codes
  @Post('create')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async createInvites(@Body() dto: CreateInvitesDto, @Request() req) {
    const expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : undefined;
    const codes = await this.inviteService.createInvites(
      dto.count || 1,
      expiresAt,
      req.user.userId
    );

    return { codes, count: codes.length };
  }

  // Claim an invite code
  @Post('claim')
  async claimInvite(@Body() dto: ClaimInviteDto, @Request() req) {
    // First validate the code exists and is valid
    const isValid = await this.inviteService.validateInviteCode(dto.code);
    
    if (!isValid) {
      return { 
        success: false, 
        error: 'Invalid or expired invite code' 
      };
    }

    // If user is authenticated, claim it
    if (req.user?.userId) {
      const claimed = await this.inviteService.claimInvite(dto.code, req.user.userId);
      return { success: claimed };
    }

    // Otherwise just validate and return success (user will sign up and claim later)
    return { 
      success: true, 
      message: 'Invite code valid. Please sign in to continue.' 
    };
  }

  // Get all invite codes (admin-only stub)
  @Get()
  @UseGuards(JwtAuthGuard)
  async getInvites(@Request() req) {
    // TODO: Add admin check here
    const invites = await this.inviteService.getInviteCodes(100);
    return { invites };
  }
}
