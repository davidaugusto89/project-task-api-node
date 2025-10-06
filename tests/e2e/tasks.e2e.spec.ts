import request from 'supertest';

import { sequelize } from '../../src/models';
import { app } from '../../src/server';
import { truncateAll } from '../helpers/db';

describe('Tasks E2E', () => {
  beforeAll(async () => {
    await sequelize.authenticate();
  });

  beforeEach(async () => {
    await truncateAll();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('POST /projects/:projectId/tasks → cria tarefa vinculada ao projeto', async () => {
    // Cenário: cria projeto
    const project = await request(app).post('/projects').send({
      name: 'Projeto para tarefas',
      description: 'Projeto para testar tarefas',
      status: 'active',
    });
    expect(project.status).toBe(201);
    const projectId: number = project.body.id;

    const payload = {
      title: 'Tarefa testar E2E',
      description: 'Testar os endpoints no E2E e validar.',
      status: 'pending',
    };

    const res = await request(app).post(`/projects/${projectId}/tasks`).send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        projectId,
        title: payload.title,
        status: payload.status,
      }),
    );
  });

  it('PUT /tasks/:id → atualiza status/título/descrição da tarefa', async () => {
    // Cenário: cria projeto + tarefa
    const project = await request(app)
      .post('/projects')
      .send({ name: 'Projeto', description: 'Projeto para testar tarefas', status: 'active' });
    const projectId: number = project.body.id;

    const task = await request(app)
      .post(`/projects/${projectId}/tasks`)
      .send({ title: 'Tarefa inicial', description: 'Primeira tarefa', status: 'pending' });
    expect(task.status).toBe(201);

    // Cenário: atualiza a tarefa
    const res = await request(app).put(`/tasks/${task.body.id}`).send({ status: 'done' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        id: task.body.id,
        status: 'done',
      }),
    );
  });

  it('DELETE /tasks/:id → remove tarefa', async () => {
    // Cenário: cria projeto + tarefa
    const project = await request(app)
      .post('/projects')
      .send({ name: 'Proj', description: 'Projeto', status: 'active' });
    const projectId: number = project.body.id;

    const task = await request(app)
      .post(`/projects/${projectId}/tasks`)
      .send({ title: 'Para remover', description: 'Primeira tarefa', status: 'pending' });
    expect(task.status).toBe(201);

    // Cenário: remove a tarefa
    const res = await request(app).delete(`/tasks/${task.body.id}`);
    expect(res.status).toBe(204);
  });

  it('POST /projects/:projectId/tasks → 404 se projectId não existe', async () => {
    const res = await request(app)
      .post('/projects/999999/tasks')
      .send({ title: 'Orfã', description: 'Primeira tarefa', status: 'pending' });
    expect(res.status).toBe(404);
  });

  it('POST /projects/:projectId/tasks → 422 sem title', async () => {
    const project = await request(app)
      .post('/projects')
      .send({ name: 'P', description: 'P', status: 'active' });
    const projectId: number = project.body.id;

    const res = await request(app).post(`/projects/${projectId}/tasks`).send({ status: 'pending' });
    expect(res.status).toBe(400);
  });

  it('POST /projects/:projectId/tasks → 422 com status inválido', async () => {
    const project = await request(app)
      .post('/projects')
      .send({ name: 'P', description: 'P', status: 'active' });
    const projectId: number = project.body.id;

    const res = await request(app)
      .post(`/projects/${projectId}/tasks`)
      .send({ title: 'T1', status: 'not-a-valid-status' });
    expect(res.status).toBe(400);
  });
});
