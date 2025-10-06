import { Task } from '../../../src/models/task';
import { TasksRepo } from '../../../src/repositories/tasks.repo';

jest.mock('../../../src/models/task');

describe('TasksRepo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    // Cenário: Criação de tarefa bem-sucedida
    it('deve criar tarefa', async () => {
      (Task.create as jest.Mock).mockResolvedValue({ id: 1 });
      const data = { title: 'Tarefa' };
      const result = await TasksRepo.create(data);
      expect(Task.create).toHaveBeenCalledWith(data);
      expect(result).toEqual({ id: 1 });
    });

    // Cenário: Dados vazios
    it('deve criar tarefa com dados vazios', async () => {
      (Task.create as jest.Mock).mockResolvedValue({ id: 2 });
      const result = await TasksRepo.create({});
      expect(Task.create).toHaveBeenCalledWith({});
      expect(result).toEqual({ id: 2 });
    });

    // Cenário: Erro ao criar tarefa
    it('deve propagar erro de Task.create', async () => {
      const error = new Error('fail');
      (Task.create as jest.Mock).mockRejectedValue(error);
      await expect(TasksRepo.create({})).rejects.toThrow(error);
    });
  });

  describe('updateById', () => {
    // Cenário: Atualização bem-sucedida
    it('deve atualizar tarefa existente', async () => {
      const mockTask = { update: jest.fn().mockResolvedValue({ id: 1, title: 'Novo' }) };
      (Task.findByPk as jest.Mock).mockResolvedValue(mockTask);
      const result = await TasksRepo.updateById(1, { title: 'Novo' });
      expect(Task.findByPk).toHaveBeenCalledWith(1);
      expect(mockTask.update).toHaveBeenCalledWith({ title: 'Novo' });
      expect(result).toEqual({ id: 1, title: 'Novo' });
    });

    // Cenário: Tarefa não encontrada retorna null
    it('deve retornar null se tarefa não encontrada', async () => {
      (Task.findByPk as jest.Mock).mockResolvedValue(null);
      const result = await TasksRepo.updateById(999, { title: 'Novo' });
      expect(result).toBeNull();
    });

    // Cenário: Erro ao buscar tarefa
    it('deve propagar erro de Task.findByPk', async () => {
      const error = new Error('fail');
      (Task.findByPk as jest.Mock).mockRejectedValue(error);
      await expect(TasksRepo.updateById(1, { title: 'Novo' })).rejects.toThrow(error);
    });

    // Cenário: Erro ao atualizar tarefa
    it('deve propagar erro de task.update', async () => {
      const mockTask = { update: jest.fn().mockRejectedValue(new Error('update fail')) };
      (Task.findByPk as jest.Mock).mockResolvedValue(mockTask);
      await expect(TasksRepo.updateById(1, { title: 'Novo' })).rejects.toThrow('update fail');
    });
  });

  describe('deleteById', () => {
    // Cenário: Remoção bem-sucedida
    it('deve remover tarefa por id', async () => {
      (Task.destroy as jest.Mock).mockResolvedValue(1);
      const result = await TasksRepo.deleteById(1);
      expect(Task.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBe(1);
    });

    // Cenário: Remoção retorna 0 (não encontrado)
    it('deve retornar 0 se tarefa não encontrada', async () => {
      (Task.destroy as jest.Mock).mockResolvedValue(0);
      const result = await TasksRepo.deleteById(999);
      expect(result).toBe(0);
    });

    // Cenário: Erro ao remover tarefa
    it('deve propagar erro de Task.destroy', async () => {
      const error = new Error('fail');
      (Task.destroy as jest.Mock).mockRejectedValue(error);
      await expect(TasksRepo.deleteById(1)).rejects.toThrow(error);
    });
  });

  describe('findById', () => {
    // Cenário: Busca por ID retorna tarefa
    it('deve buscar tarefa por id', async () => {
      (Task.findByPk as jest.Mock).mockResolvedValue({ id: 1 });
      const result = await TasksRepo.findById(1);
      expect(Task.findByPk).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1 });
    });

    // Cenário: Busca por ID não encontrada
    it('deve retornar null se não encontrar tarefa', async () => {
      (Task.findByPk as jest.Mock).mockResolvedValue(null);
      const result = await TasksRepo.findById(999);
      expect(result).toBeNull();
    });

    // Cenário: Erro ao buscar tarefa por id
    it('deve propagar erro de Task.findByPk', async () => {
      const error = new Error('fail');
      (Task.findByPk as jest.Mock).mockRejectedValue(error);
      await expect(TasksRepo.findById(1)).rejects.toThrow(error);
    });
  });
});
