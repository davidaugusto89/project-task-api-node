import { Project } from '../../../src/models/project';
import { Task } from '../../../src/models/task';
import { ProjectsRepo } from '../../../src/repositories/projects.repo';

jest.mock('../../../src/models/project');
jest.mock('../../../src/models/task');

describe('ProjectsRepo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    // Cenário: Criação de projeto bem-sucedida
    it('deve criar projeto', async () => {
      // Arrange
      (Project.create as jest.Mock).mockResolvedValue({ id: 1 });
      const data = { name: 'Projeto' };
      // Act
      const result = await ProjectsRepo.create(data);
      // Assert
      expect(Project.create).toHaveBeenCalledWith(data);
      expect(result).toEqual({ id: 1 });
    });

    // Cenário: Dados vazios
    it('deve criar projeto com dados vazios', async () => {
      (Project.create as jest.Mock).mockResolvedValue({ id: 2 });
      const result = await ProjectsRepo.create({});
      expect(Project.create).toHaveBeenCalledWith({});
      expect(result).toEqual({ id: 2 });
    });

    // Cenário: Erro ao criar projeto
    it('deve propagar erro de Project.create', async () => {
      const error = new Error('fail');
      (Project.create as jest.Mock).mockRejectedValue(error);
      await expect(ProjectsRepo.create({})).rejects.toThrow(error);
    });
  });

  describe('findAll', () => {
    // Cenário: Busca de todos os projetos
    it('deve buscar todos os projetos', async () => {
      (Project.findAll as jest.Mock).mockResolvedValue([{ id: 1 }]);
      const result = await ProjectsRepo.findAll();
      expect(Project.findAll).toHaveBeenCalledWith({
        include: [{ model: Task, as: 'tasks' }],
      });
      expect(result).toEqual([{ id: 1 }]);
    });

    // Cenário: Busca com opções customizadas
    it('deve buscar projetos com opções customizadas', async () => {
      (Project.findAll as jest.Mock).mockResolvedValue([{ id: 2 }]);
      const options = { where: { status: 'active' } };
      const result = await ProjectsRepo.findAll(options);
      expect(Project.findAll).toHaveBeenCalledWith({
        include: [{ model: Task, as: 'tasks' }],
        ...options,
      });
      expect(result).toEqual([{ id: 2 }]);
    });

    // Cenário: Erro ao buscar projetos
    it('deve propagar erro de Project.findAll', async () => {
      const error = new Error('fail');
      (Project.findAll as jest.Mock).mockRejectedValue(error);
      await expect(ProjectsRepo.findAll()).rejects.toThrow(error);
    });
  });

  describe('findById', () => {
    // Cenário: Busca por ID retorna projeto
    it('deve buscar projeto por id', async () => {
      (Project.findByPk as jest.Mock).mockResolvedValue({ id: 1 });
      const result = await ProjectsRepo.findById(1);
      expect(Project.findByPk).toHaveBeenCalledWith(1, {
        include: [{ model: Task, as: 'tasks' }],
      });
      expect(result).toEqual({ id: 1 });
    });

    // Cenário: Busca por ID não encontrado
    it('deve retornar null se não encontrar projeto', async () => {
      (Project.findByPk as jest.Mock).mockResolvedValue(null);
      const result = await ProjectsRepo.findById(999);
      expect(result).toBeNull();
    });

    // Cenário: Erro ao buscar projeto por id
    it('deve propagar erro de Project.findByPk', async () => {
      const error = new Error('fail');
      (Project.findByPk as jest.Mock).mockRejectedValue(error);
      await expect(ProjectsRepo.findById(1)).rejects.toThrow(error);
    });
  });

  describe('updateById', () => {
    // Cenário: Atualização bem-sucedida
    it('deve atualizar projeto existente', async () => {
      const mockProject = { update: jest.fn().mockResolvedValue({ id: 1, name: 'Novo' }) };
      (Project.findByPk as jest.Mock).mockResolvedValue(mockProject);
      const result = await ProjectsRepo.updateById(1, { name: 'Novo' });
      expect(Project.findByPk).toHaveBeenCalledWith(1);
      expect(mockProject.update).toHaveBeenCalledWith({ name: 'Novo' });
      expect(result).toEqual({ id: 1, name: 'Novo' });
    });

    // Cenário: Projeto não encontrado retorna null
    it('deve retornar null se projeto não encontrado', async () => {
      (Project.findByPk as jest.Mock).mockResolvedValue(null);
      const result = await ProjectsRepo.updateById(999, { name: 'Novo' });
      expect(result).toBeNull();
    });

    // Cenário: Erro ao buscar projeto
    it('deve propagar erro de Project.findByPk', async () => {
      const error = new Error('fail');
      (Project.findByPk as jest.Mock).mockRejectedValue(error);
      await expect(ProjectsRepo.updateById(1, { name: 'Novo' })).rejects.toThrow(error);
    });

    // Cenário: Erro ao atualizar projeto
    it('deve propagar erro de project.update', async () => {
      const mockProject = { update: jest.fn().mockRejectedValue(new Error('update fail')) };
      (Project.findByPk as jest.Mock).mockResolvedValue(mockProject);
      await expect(ProjectsRepo.updateById(1, { name: 'Novo' })).rejects.toThrow('update fail');
    });
  });

  describe('deleteById', () => {
    // Cenário: Remoção bem-sucedida
    it('deve remover projeto por id', async () => {
      (Project.destroy as jest.Mock).mockResolvedValue(1);
      const result = await ProjectsRepo.deleteById(1);
      expect(Project.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBe(1);
    });

    // Cenário: Remoção retorna 0 (não encontrado)
    it('deve retornar 0 se projeto não encontrado', async () => {
      (Project.destroy as jest.Mock).mockResolvedValue(0);
      const result = await ProjectsRepo.deleteById(999);
      expect(result).toBe(0);
    });

    // Cenário: Erro ao remover projeto
    it('deve propagar erro de Project.destroy', async () => {
      const error = new Error('fail');
      (Project.destroy as jest.Mock).mockRejectedValue(error);
      await expect(ProjectsRepo.deleteById(1)).rejects.toThrow(error);
    });
  });
});
