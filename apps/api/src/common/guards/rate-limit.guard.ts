import { CanActivate, ExecutionContext, Injectable, HttpException, HttpStatus } from '@nestjs/common';

type Bucket = { tokens: number; lastRefill: number };
const buckets = new Map<string, Bucket>();

// Configuration
const CAP = 20;           // 20 actions per user
const WINDOW_MS = 60000;  // per 60 seconds (1 minute)
const REFILL_RATE = CAP / WINDOW_MS; // tokens per millisecond

function takeToken(id: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(id) || { tokens: CAP, lastRefill: now };
  
  // Refill tokens based on time elapsed
  const elapsed = now - bucket.lastRefill;
  bucket.tokens = Math.min(CAP, bucket.tokens + elapsed * REFILL_RATE);
  bucket.lastRefill = now;
  
  // Check if we have enough tokens
  if (bucket.tokens < 1) {
    buckets.set(id, bucket);
    return false;
  }
  
  // Consume one token
  bucket.tokens -= 1;
  buckets.set(id, bucket);
  return true;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<any>();
    const userId = request.user?.userId;
    const ip = this.getClientIp(request);
    
    // Use userId if authenticated, otherwise fall back to IP
    const key = userId ? `user:${userId}` : `ip:${ip}`;
    
    const allowed = takeToken(key);
    
    if (!allowed) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Rate limit exceeded. Please try again in a moment.',
          retryAfter: Math.ceil(WINDOW_MS / 1000),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    
    return true;
  }
  
  private getClientIp(request: any): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    return request.socket?.remoteAddress || 'unknown';
  }
}

// Optional: Cleanup old buckets periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (now - bucket.lastRefill > WINDOW_MS * 2) {
      buckets.delete(key);
    }
  }
}, WINDOW_MS * 5); // Cleanup every 5 minutes
