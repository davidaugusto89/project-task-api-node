import request from 'supertest';
import { app } from '../../src/server';
import { truncateAll } from '../helpers/db';

describe('Projects E2E', () => {
  beforeEach(async () => {
    await truncateAll();
  });

  it('POST /projects → cria projeto', async () => {
    // Cenário: cria projeto
    const payload = {
      name: 'Projeto inserido E2E',
      description: 'Primeiro projeto criado pelo E2E',
      status: 'active',
    };

    const res = await request(app).post('/projects').send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: payload.name,
        description: payload.description,
        status: payload.status,
      }),
    );
  });

  it('GET /projects → lista projetos', async () => {
    // Cenário: cria projeto
    await request(app).post('/projects').send({
      name: 'A',
      description: 'Projeto A',
      status: 'active',
    });
    const res = await request(app).get('/projects');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toEqual(
      expect.objectContaining({ id: expect.any(Number), name: expect.any(String) }),
    );
  });

  it('GET /projects/:id → retorna dados do projeto', async () => {
    // Cenário: cria projeto
    const create = await request(app).post('/projects').send({
      name: 'B',
      description: 'Projeto B',
      status: 'active',
    });
    const id = create.body.id;

    const res = await request(app).get(`/projects/${id}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ id, name: 'B' }));
  });

  it('PUT /projects/:id → atualiza projeto', async () => {
    // Cenário: cria projeto
    const create = await request(app).post('/projects').send({
      name: 'D',
      description: 'Projeto D',
      status: 'active',
    });
    const id = create.body.id;

    const res = await request(app).put(`/projects/${id}`).send({
      name: 'C atualizado',
      description: 'Descrição atualizada',
      status: 'active',
    });
    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({ id, name: 'C atualizado', description: 'Descrição atualizada' }),
    );
  });

  it('DELETE /projects/:id → remove projeto', async () => {
    // Cenário: cria projeto
    const create = await request(app).post('/projects').send({ name: 'D', description: 'Projeto D', status: 'active' });
    const id = create.body.id;

    const res = await request(app).delete(`/projects/${id}`);
    expect(res.status).toBe(204);
  });
});
