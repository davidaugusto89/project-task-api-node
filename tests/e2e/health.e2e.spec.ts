import request from 'supertest';
import { app } from '../../src/server';

describe('Health', () => {
  it('GET /health -> 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: 'ok',
      message: expect.stringContaining('This is the way'),
    });
  });
});