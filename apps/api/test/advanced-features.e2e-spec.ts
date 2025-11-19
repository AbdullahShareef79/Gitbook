import request from 'supertest';

const API_BASE = 'http://localhost:4000';

describe('Invite Codes E2E', () => {
  let authToken: string;
  let inviteCode: string;

  beforeAll(async () => {
    // This would require proper test authentication setup
    authToken = 'test-jwt-token';
  });

  it('should create invite codes (admin)', async () => {
    const response = await request(API_BASE)
      .post('/auth/invite/create')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ count: 5 })
      .expect(201);

    expect(response.body.codes).toHaveLength(5);
    expect(response.body.count).toBe(5);
    inviteCode = response.body.codes[0];
  });

  it('should validate invite code', async () => {
    const response = await request(API_BASE)
      .post('/auth/invite/claim')
      .send({ code: inviteCode })
      .expect(200);

    expect(response.body.success).toBe(true);
  });

  it('should reject invalid invite code', async () => {
    const response = await request(API_BASE)
      .post('/auth/invite/claim')
      .send({ code: 'INVALID123' })
      .expect(200);

    expect(response.body.success).toBe(false);
  });
});

describe('Jam Templates E2E', () => {
  it('should get jam templates', async () => {
    const response = await request(API_BASE)
      .get('/jam-templates')
      .expect(200);

    expect(response.body.templates).toBeInstanceOf(Array);
  });

  it('should create jam with template', async () => {
    // Requires auth token
    // const response = await request(API_BASE)
    //   .post('/jams')
    //   .set('Authorization', `Bearer ${authToken}`)
    //   .send({ templateId: 'tmpl_js' })
    //   .expect(201);

    // expect(response.body.id).toBeDefined();
  });
});

describe('Moderation E2E', () => {
  let authToken: string;
  let postId: string;
  let flagId: string;

  it.skip('should flag a post', async () => {
    const response = await request(API_BASE)
      .post(`/posts/${postId}/flags`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ reason: 'Inappropriate content' })
      .expect(201);

    expect(response.body.success).toBe(true);
    flagId = response.body.flag.id;
  });

  it.skip('should get flags (admin)', async () => {
    const response = await request(API_BASE)
      .get('/flags')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.items).toBeInstanceOf(Array);
  });

  it.skip('should resolve flag (admin)', async () => {
    const response = await request(API_BASE)
      .post(`/flags/${flagId}/resolve`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'RESOLVED' })
      .expect(200);

    expect(response.body.success).toBe(true);
  });
});

describe('Feedback E2E', () => {
  let authToken: string;

  it.skip('should submit feedback', async () => {
    const response = await request(API_BASE)
      .post('/feedback')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ text: 'Great platform!' })
      .expect(201);

    expect(response.body.success).toBe(true);
  });

  it('should submit waitlist (no auth)', async () => {
    const response = await request(API_BASE)
      .post('/feedback/waitlist')
      .send({ text: 'test@example.com' })
      .expect(201);

    expect(response.body.success).toBe(true);
  });
});

describe('Notifications SSE E2E', () => {
  it.skip('should stream notifications via SSE', (done) => {
    // SSE testing requires EventSource or similar
    // This is a placeholder for the test structure
    done();
  });
});

describe('Profile Followers/Following E2E', () => {
  const testHandle = 'testuser';

  it('should get followers by handle', async () => {
    const response = await request(API_BASE)
      .get(`/users/profile/${testHandle}/followers`)
      .expect(200);

    expect(response.body).toHaveProperty('items');
    expect(response.body.items).toBeInstanceOf(Array);
  });

  it('should get following by handle', async () => {
    const response = await request(API_BASE)
      .get(`/users/profile/${testHandle}/following`)
      .expect(200);

    expect(response.body).toHaveProperty('items');
    expect(response.body.items).toBeInstanceOf(Array);
  });
});
