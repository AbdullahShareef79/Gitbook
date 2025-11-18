# E2E Tests

## Overview
This directory contains end-to-end tests for the DevSocial API using Jest and Supertest.

## Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test feed.e2e-spec.ts

# Run with coverage
pnpm test:cov

# Run in watch mode
pnpm test:watch
```

## Test Files

### feed.e2e-spec.ts
Tests for feed pagination and ranking:
- ✅ Returns feed with items and nextCursor
- ✅ Respects limit parameter (max 50)
- ✅ Stable ordering across pages
- ✅ Returns null nextCursor on last page

### follow.e2e-spec.ts
Tests for follow/unfollow system:
- ✅ Requires authentication
- ⚠️ Follow/unfollow roundtrip (requires test auth)
- ⚠️ Cannot follow yourself (requires test auth)
- ✅ Returns followers/following lists with pagination

### notifications.e2e-spec.ts
Tests for notifications system:
- ✅ Requires authentication
- ⚠️ Returns notifications with cursor pagination (requires test auth)
- ⚠️ Returns unread count (requires test auth)
- ⚠️ Marks notifications as read (requires test auth)
- ⚠️ Creates notification on interactions (requires test data)

### health.e2e-spec.ts
Tests for health endpoints and rate limiting:
- ✅ /health returns OK
- ✅ /health/db returns OK
- ✅ /health/feed returns OK with post count
- ⚠️ Rate limiting returns 429 (requires test auth)

## Notes

- Tests marked with ⚠️ require authentication setup
- Some tests are skipped (.skip) until proper test auth is configured
- Health endpoint tests should all pass without authentication
- Rate limiting tests need actual JWT tokens to test properly

## Setup Test Authentication

To enable authenticated tests, you need to:

1. Create a test user in the database
2. Generate a valid JWT token for testing
3. Set `authToken` in test files
4. Remove `.skip` from authenticated tests

Example:
```typescript
const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

## Future Improvements

- [ ] Add test database seeding
- [ ] Implement test auth helper
- [ ] Add integration tests for WebSocket (jam presence)
- [ ] Add performance/load tests
- [ ] Add test coverage reporting
