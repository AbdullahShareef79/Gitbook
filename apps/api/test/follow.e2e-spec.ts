import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Follow System (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let testUserId: string;
  let targetUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // TODO: Set up test users and get auth tokens
    // For now, these tests will be skipped without proper auth
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /users/:id/follow', () => {
    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .post('/users/some-user-id/follow')
        .expect(401);
    });

    it.skip('should follow a user successfully', async () => {
      // Skip without auth token
      const response = await request(app.getHttpServer())
        .post(`/users/${targetUserId}/follow`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('follow');
    });

    it.skip('should not allow following yourself', async () => {
      await request(app.getHttpServer())
        .post(`/users/${testUserId}/follow`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('DELETE /users/:id/follow', () => {
    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .delete('/users/some-user-id/follow')
        .expect(401);
    });

    it.skip('should unfollow a user successfully', async () => {
      // First follow
      await request(app.getHttpServer())
        .post(`/users/${targetUserId}/follow`)
        .set('Authorization', `Bearer ${authToken}`);

      // Then unfollow
      const response = await request(app.getHttpServer())
        .delete(`/users/${targetUserId}/follow`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('GET /users/:id/followers', () => {
    it('should return followers list with cursor pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/some-user-id/followers?limit=10')
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('nextCursor');
      expect(Array.isArray(response.body.items)).toBe(true);
    });
  });

  describe('GET /users/:id/following', () => {
    it('should return following list with cursor pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/some-user-id/following?limit=10')
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('nextCursor');
      expect(Array.isArray(response.body.items)).toBe(true);
    });
  });
});
