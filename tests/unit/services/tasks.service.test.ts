// Testes unitários para src/services/tasks.service.ts

jest.mock('../../../src/repositories/projects.repo', () => ({
  ProjectsRepo: { findById: jest.fn() },
}));
jest.mock('../../../src/repositories/tasks.repo', () => ({
  TasksRepo: { create: jest.fn(), updateById: jest.fn(), deleteById: jest.fn() },
}));

import { ProjectsRepo } from '../../../src/repositories/projects.repo';
import { TasksRepo } from '../../../src/repositories/tasks.repo';
import { TasksService } from '../../../src/services/tasks.service';

const mockedProjectsRepo = ProjectsRepo as unknown as { findById: jest.Mock };
const mockedTasksRepo = TasksRepo as unknown as {
  create: jest.Mock;
  updateById: jest.Mock;
  deleteById: jest.Mock;
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2025-08-14T00:00:00.000Z'));
});

afterEach(() => {
  jest.useRealTimers();
});

describe('TasksService', () => {
  // Cenário: create lança 404 se projeto não existe
  it('create throws 404 when Projeto não encontrado', async () => {
    // Arrange
    mockedProjectsRepo.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(TasksService.create(1, { title: 't' })).rejects.toMatchObject({
      message: 'Projeto não encontrado',
      status: 404,
    });
  });

  // Cenário: create cria tarefa com projectId anexado e retorna o resultado
  it('create creates task and forwards projectId to TasksRepo.create', async () => {
    // Arrange
    const project = { id: 10 };
    mockedProjectsRepo.findById.mockResolvedValue(project);
    const payload = { title: '', description: undefined, status: null };
    const created = { id: 99, ...payload, projectId: 10 };
    mockedTasksRepo.create.mockResolvedValue(created);

    // Act
    const res = await TasksService.create(10, payload);

    // Assert
    expect(mockedProjectsRepo.findById).toHaveBeenCalledWith(10);
    expect(mockedTasksRepo.create).toHaveBeenCalledWith({ ...payload, projectId: 10 });
    expect(res).toEqual(created);
  });

  // Cenário: update retorna objeto atualizado quando existe
  it('update returns updated task when found', async () => {
    // Arrange
    const updated = { id: 5, title: 'updated' };
    mockedTasksRepo.updateById.mockResolvedValue(updated);

    // Act
    const res = await TasksService.update(5, { title: 'updated' });

    // Assert
    expect(mockedTasksRepo.updateById).toHaveBeenCalledWith(5, { title: 'updated' });
    expect(res).toEqual(updated);
  });

  // Cenário: update lança 404 quando tarefa não encontrada
  it('update throws 404 when task not found', async () => {
    // Arrange
    mockedTasksRepo.updateById.mockResolvedValue(null);

    // Act & Assert
    await expect(TasksService.update(123, { title: 'x' })).rejects.toMatchObject({
      message: 'Task not found',
      status: 404,
    });
  });

  // Cenário: remove resolve quando deleteById retorna >0
  it('remove resolves when deleteById returns positive', async () => {
    // Arrange
    mockedTasksRepo.deleteById.mockResolvedValue(1);

    // Act & Assert
    await expect(TasksService.remove(7)).resolves.toBeUndefined();
    expect(mockedTasksRepo.deleteById).toHaveBeenCalledWith(7);
  });

  // Cenário: remove lança 404 quando deleteById retorna 0
  it('remove throws 404 quando deleteById retorna zero', async () => {
    // Arrange
    mockedTasksRepo.deleteById.mockResolvedValue(0);

    // Act & Assert
    await expect(TasksService.remove(8)).rejects.toMatchObject({
      message: 'Task not found',
      status: 404,
    });
  });
});
