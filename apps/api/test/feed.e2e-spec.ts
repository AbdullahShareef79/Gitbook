import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Feed Pagination (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // TODO: Set up a test user and get auth token
    // For now, we'll test public endpoints
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /posts/feed', () => {
    it('should return feed with items and nextCursor', async () => {
      const response = await request(app.getHttpServer())
        .get('/posts/feed?limit=5')
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('nextCursor');
      expect(Array.isArray(response.body.items)).toBe(true);
    });

    it('should respect limit parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/posts/feed?limit=3')
        .expect(200);

      expect(response.body.items.length).toBeLessThanOrEqual(3);
    });

    it('should enforce max limit of 50', async () => {
      const response = await request(app.getHttpServer())
        .get('/posts/feed?limit=100')
        .expect(200);

      // Should cap at 50, but we fetch limit+1 internally
      expect(response.body.items.length).toBeLessThanOrEqual(50);
    });

    it('should return stable ordering across pages', async () => {
      const page1 = await request(app.getHttpServer())
        .get('/posts/feed?limit=2')
        .expect(200);

      if (!page1.body.nextCursor) {
        // Not enough data for pagination test
        return;
      }

      const page2 = await request(app.getHttpServer())
        .get(`/posts/feed?limit=2&cursor=${page1.body.nextCursor}`)
        .expect(200);

      // Ensure no overlap between pages
      const page1Ids = page1.body.items.map((p: any) => p.id);
      const page2Ids = page2.body.items.map((p: any) => p.id);

      const overlap = page1Ids.filter((id: string) => page2Ids.includes(id));
      expect(overlap.length).toBe(0);
    });

    it('should return null nextCursor on last page', async () => {
      // Get all items with a large limit
      const response = await request(app.getHttpServer())
        .get('/posts/feed?limit=1000')
        .expect(200);

      expect(response.body.nextCursor).toBeNull();
    });
  });
});
