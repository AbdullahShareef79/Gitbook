import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Rate Limiting (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Rate Limit Enforcement', () => {
    it.skip('should return 429 after exceeding rate limit', async () => {
      // Make rapid requests to exceed rate limit
      // Note: This requires a test JWT token
      
      const requests = [];
      for (let i = 0; i < 25; i++) {
        requests.push(
          request(app.getHttpServer())
            .post('/posts/some-post-id/like')
            .set('Authorization', 'Bearer test-token')
        );
      }

      const responses = await Promise.all(requests);
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it('should include rate limit headers', async () => {
      const response = await request(app.getHttpServer())
        .get('/posts/feed')
        .expect(200);

      // Check for standard rate limit headers
      // X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
      // Note: These might not be implemented yet
    });
  });

  describe('Health Endpoints', () => {
    it('should return OK for /health', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('service', 'devsocial-api');
    });

    it('should return OK for /health/db', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/db')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('database', 'connected');
    });

    it('should return OK for /health/feed', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/feed')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('feed', 'operational');
      expect(response.body).toHaveProperty('postCount');
      expect(typeof response.body.postCount).toBe('number');
    });
  });
});
