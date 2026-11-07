import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { app } from '../../app';

describe('auth endpoints', () => {
  it('exposes health endpoint', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});
