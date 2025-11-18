import { Controller, Post, Body, UseGuards, Request, Headers, RawBodyRequest, Req } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { IsString, IsNumber } from 'class-validator';

class CreateCheckoutDto {
  @IsString()
  itemId: string;

  @IsNumber()
  priceCents: number;

  @IsString()
  sellerId: string;
}

@Controller('marketplace')
export class MarketplaceController {
  constructor(private marketplace: MarketplaceService) {}

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  async createCheckout(@Body() dto: CreateCheckoutDto, @Request() req) {
    return this.marketplace.createCheckoutSession({
      ...dto,
      buyerId: req.user.userId,
    });
  }

  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.marketplace.handleWebhook(req.rawBody, signature);
  }
}
