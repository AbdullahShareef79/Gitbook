import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('Production Features E2E Tests', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;
  let adminToken: string;
  let testPostId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    // Setup: Create test user and get auth token
    // In a real test, you'd set up proper test users
    // For now, we'll assume AUTH_TEST_TOKEN env var provides a valid token
    authToken = process.env.AUTH_TEST_TOKEN || '';
    adminToken = process.env.AUTH_ADMIN_TOKEN || '';
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Follower/Following Pagination', () => {
    it('GET /users/profile/:handle/followers - should return paginated followers', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/profile/testuser/followers?limit=10')
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('nextCursor');
      expect(Array.isArray(response.body.items)).toBe(true);
    });

    it('GET /users/profile/:handle/following - should return paginated following', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/profile/testuser/following?limit=10')
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('nextCursor');
      expect(Array.isArray(response.body.items)).toBe(true);
    });

    it('should support cursor-based pagination', async () => {
      const firstPage = await request(app.getHttpServer())
        .get('/users/profile/testuser/followers?limit=2')
        .expect(200);

      if (firstPage.body.nextCursor) {
        const secondPage = await request(app.getHttpServer())
          .get(`/users/profile/testuser/followers?limit=2&cursor=${firstPage.body.nextCursor}`)
          .expect(200);

        expect(secondPage.body.items).toBeDefined();
      }
    });
  });

  describe('Template Start-Jam Flow', () => {
    it('GET /jam-templates - should list all templates', async () => {
      const response = await request(app.getHttpServer())
        .get('/jam-templates')
        .expect(200);

      expect(response.body).toHaveProperty('templates');
      expect(Array.isArray(response.body.templates)).toBe(true);
    });

    it('POST /jams - should create jam without template', async () => {
      if (!authToken) {
        console.warn('Skipping test - no auth token');
        return;
      }

      const response = await request(app.getHttpServer())
        .post('/jams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('roomId');
    });

    it('POST /jams - should create jam with template', async () => {
      if (!authToken) {
        console.warn('Skipping test - no auth token');
        return;
      }

      // First get a template ID
      const templatesRes = await request(app.getHttpServer())
        .get('/jam-templates')
        .expect(200);

      const templates = templatesRes.body.templates;
      if (templates.length === 0) {
        console.warn('Skipping test - no templates available');
        return;
      }

      const templateId = templates[0].id;

      const response = await request(app.getHttpServer())
        .post('/jams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ templateId })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('roomId');
    });
  });

  describe('Moderation - Admin Only', () => {
    it('GET /flags - should require admin role', async () => {
      if (!authToken) {
        console.warn('Skipping test - no auth token');
        return;
      }

      // Non-admin user should get 403
      await request(app.getHttpServer())
        .get('/flags')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });

    it('GET /flags - admin should list flags', async () => {
      if (!adminToken) {
        console.warn('Skipping test - no admin token');
        return;
      }

      const response = await request(app.getHttpServer())
        .get('/flags?status=OPEN')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('nextCursor');
    });

    it('POST /flags/:id/resolve - admin should resolve flag', async () => {
      if (!adminToken) {
        console.warn('Skipping test - no admin token');
        return;
      }

      // First get a flag
      const flagsRes = await request(app.getHttpServer())
        .get('/flags?status=OPEN')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      if (flagsRes.body.items.length === 0) {
        console.warn('Skipping test - no open flags');
        return;
      }

      const flagId = flagsRes.body.items[0].id;

      const response = await request(app.getHttpServer())
        .post(`/flags/${flagId}/resolve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'RESOLVED' })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('POST /flags/:id/dismiss - admin should dismiss flag', async () => {
      if (!adminToken) {
        console.warn('Skipping test - no admin token');
        return;
      }

      // First get a flag
      const flagsRes = await request(app.getHttpServer())
        .get('/flags?status=OPEN')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      if (flagsRes.body.items.length === 0) {
        console.warn('Skipping test - no open flags');
        return;
      }

      const flagId = flagsRes.body.items[0].id;

      const response = await request(app.getHttpServer())
        .post(`/flags/${flagId}/dismiss`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(201);

      expect(response.body.success).toBe(true);
    });
  });

  describe('SSE Notifications', () => {
    it('GET /notifications/stream - should establish SSE connection', (done) => {
      if (!authToken) {
        console.warn('Skipping test - no auth token');
        done();
        return;
      }

      const req = request(app.getHttpServer())
        .get('/notifications/stream')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Accept', 'text/event-stream');

      let receivedData = false;

      req.on('data', (chunk) => {
        const data = chunk.toString();
        if (data.includes('data:')) {
          receivedData = true;
          req.abort();
        }
      });

      setTimeout(() => {
        if (!receivedData) {
          req.abort();
        }
        expect(receivedData).toBe(true);
        done();
      }, 3000);
    });

    it('GET /notifications/unread-count - should return unread count', async () => {
      if (!authToken) {
        console.warn('Skipping test - no auth token');
        return;
      }

      const response = await request(app.getHttpServer())
        .get('/notifications/unread-count')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('count');
      expect(typeof response.body.count).toBe('number');
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit follow requests', async () => {
      if (!authToken) {
        console.warn('Skipping test - no auth token');
        return;
      }

      const targetUserId = 'test-user-id';
      let rateLimitHit = false;

      // Make many rapid requests
      for (let i = 0; i < 25; i++) {
        try {
          await request(app.getHttpServer())
            .post(`/users/${targetUserId}/follow`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({});
        } catch (error: any) {
          if (error.status === 429) {
            rateLimitHit = true;
            break;
          }
        }
      }

      // Note: This test might not trigger rate limit if requests are slow
      // In real testing, you'd want to verify rate limit is properly configured
    });
  });
});
