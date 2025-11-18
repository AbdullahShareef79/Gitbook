import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MarketplaceService {
  private stripe: Stripe;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    const secretKey = config.get('STRIPE_SECRET_KEY');
    if (secretKey) {
      this.stripe = new Stripe(secretKey, { apiVersion: '2023-10-16' });
    }
  }

  async createCheckoutSession(data: {
    itemId: string;
    priceCents: number;
    buyerId: string;
    sellerId: string;
  }) {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Item ${data.itemId}`,
            },
            unit_amount: data.priceCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${this.config.get('NEXT_PUBLIC_APP_URL')}/marketplace/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.config.get('NEXT_PUBLIC_APP_URL')}/marketplace/cancel`,
      metadata: {
        itemId: data.itemId,
        buyerId: data.buyerId,
        sellerId: data.sellerId,
      },
    });

    return { url: session.url };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    const webhookSecret = this.config.get('STRIPE_WEBHOOK_SECRET');
    const event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    // Handle different event types
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      // TODO: Update transaction status in database
      console.log('Payment successful:', session.id);
    }

    return { received: true };
  }

  async getItems() {
    return this.prisma.marketplaceItem.findMany({
      take: 50,
    });
  }

  async getItem(id: string) {
    return this.prisma.marketplaceItem.findUnique({
      where: { id },
    });
  }
}
