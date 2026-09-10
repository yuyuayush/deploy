import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('Users API Endpoints', () => {
  it('GET /api/v1/users should return a list of users', async () => {
    const res = await request(app).get('/api/v1/users');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/users/:id with valid UUID should return user', async () => {
    const validId = '123e4567-e89b-12d3-a456-426614174000';
    const res = await request(app).get(`/api/v1/users/${validId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id', validId);
  });

  it('GET /api/v1/users/:id with invalid UUID should return 422 Unprocessable Entity', async () => {
    const res = await request(app).get('/api/v1/users/invalid-uuid-123');
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation Error');
  });

  it('POST /api/v1/users with valid payload should create a user', async () => {
    const payload = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'user',
    };

    const res = await request(app).post('/api/v1/users').send(payload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.email).toBe(payload.email);
  });

  it('POST /api/v1/users with invalid email should return 422 Validation Error', async () => {
    const payload = {
      name: 'John Doe',
      email: 'not-an-email',
    };

    const res = await request(app).post('/api/v1/users').send(payload);
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/users with duplicate email should return 409 Conflict', async () => {
    const payload = {
      name: 'Duplicate Test',
      email: 'alex.johnson@example.com',
    };

    const res = await request(app).post('/api/v1/users').send(payload);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });
});
