// Testes unitários para src/services/projects.service.ts

jest.mock('../../../src/repositories/projects.repo', () => ({
  ProjectsRepo: {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    updateById: jest.fn(),
    deleteById: jest.fn(),
  },
}));

import { ProjectsRepo } from '../../../src/repositories/projects.repo';
import { ProjectsService } from '../../../src/services/projects.service';

const mockedProjectsRepo = ProjectsRepo as unknown as {
  create: jest.Mock;
  findAll: jest.Mock;
  findById: jest.Mock;
  updateById: jest.Mock;
  deleteById: jest.Mock;
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ProjectsService', () => {
  // Cenário: create deve encaminhar payload para o repositório e retornar o projeto criado
  it('create: forwards payload to ProjectsRepo.create and returns created project', async () => {
    // Arrange
    const payload = { name: 'Novo', description: null, status: 'active' as const };
    const created = { id: 1, ...payload };
    mockedProjectsRepo.create.mockResolvedValue(created);

    // Act
    const res = await ProjectsService.create(payload);

    // Assert
    expect(mockedProjectsRepo.create).toHaveBeenCalledWith(payload);
    expect(res).toEqual(created);
  });

  // Cenário: list retorna lista de projetos (inclui caso vazio)
  it('list: returns array of projects (including empty array)', async () => {
    // Arrange
    const list = [{ id: 1, name: 'p1' }];
    mockedProjectsRepo.findAll.mockResolvedValue(list);

    // Act
    const res = await ProjectsService.list();

    // Assert
    expect(mockedProjectsRepo.findAll).toHaveBeenCalled();
    expect(res).toEqual(list);

    // Edge: empty list
    mockedProjectsRepo.findAll.mockResolvedValue([]);
    const resEmpty = await ProjectsService.list();
    expect(resEmpty).toEqual([]);
  });

  // Cenário: get retorna projeto se encontrado
  it('get: returns project when found', async () => {
    // Arrange
    const project = { id: 2, name: 'p2' };
    mockedProjectsRepo.findById.mockResolvedValue(project);

    // Act
    const res = await ProjectsService.get(2);

    // Assert
    expect(mockedProjectsRepo.findById).toHaveBeenCalledWith(2);
    expect(res).toEqual(project);
  });

  // Cenário: get lança 404 quando projeto não encontrado
  it('get: throws 404 when Projeto não encontrado', async () => {
    // Arrange
    mockedProjectsRepo.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(ProjectsService.get(999)).rejects.toMatchObject({
      message: 'Projeto não encontrado',
      status: 404,
    });
  });

  // Cenário: update retorna objeto quando updateById encontra e atualiza
  it('update: returns updated project when updateById succeeds', async () => {
    // Arrange
    const payload = { name: 'Updated' };
    const updated = { id: 3, ...payload };
    mockedProjectsRepo.updateById.mockResolvedValue(updated);

    // Act
    const res = await ProjectsService.update(3, payload);

    // Assert
    expect(mockedProjectsRepo.updateById).toHaveBeenCalledWith(3, payload);
    expect(res).toEqual(updated);
  });

  // Cenário: update lança 404 quando não existe projeto para atualizar
  it('update: throws 404 when updateById returns null', async () => {
    // Arrange
    mockedProjectsRepo.updateById.mockResolvedValue(null);

    // Act & Assert
    await expect(ProjectsService.update(123, { name: 'x' })).rejects.toMatchObject({
      message: 'Projeto não encontrado',
      status: 404,
    });
  });

  // Cenário: remove resolve quando deleteById retorna 1 e lança 404 quando retorna 0
  it('remove: resolves when deleteById returns positive and throws 404 when zero', async () => {
    // Arrange: success
    mockedProjectsRepo.deleteById.mockResolvedValue(1);

    // Act
    await expect(ProjectsService.remove(5)).resolves.toBeUndefined();
    expect(mockedProjectsRepo.deleteById).toHaveBeenCalledWith(5);

    // Arrange: failure
    mockedProjectsRepo.deleteById.mockResolvedValue(0);
    await expect(ProjectsService.remove(6)).rejects.toMatchObject({
      message: 'Projeto não encontrado',
      status: 404,
    });
  });
});
