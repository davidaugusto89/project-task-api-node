import { TasksController } from '../../../src/controllers/tasks.controller';
import { TasksService } from '../../../src/services/tasks.service';

jest.mock('../../../src/services/tasks.service');

type MockReq = Partial<{ body: any; params: any }>;
type MockRes = { status: jest.Mock; json: jest.Mock; send: jest.Mock };
type MockNext = jest.Mock;

function getMockRes(): MockRes {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };
}

describe('TasksController', () => {
  let req: MockReq;
  let res: MockRes;
  let next: MockNext;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = getMockRes();
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('create', () => {
    // Cenário: Criação de tarefa bem-sucedida retorna status 201 e a tarefa criada
    it('deve criar tarefa e retornar 201', async () => {
      (TasksService.create as jest.Mock).mockResolvedValue({ id: 1, title: 'Tarefa' });
      req.body = { title: 'Tarefa' };
      req.params = { projectId: '2' };
      await TasksController.create(req as any, res as any, next);
      expect(TasksService.create).toHaveBeenCalledWith(2, req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 1, title: 'Tarefa' });
      expect(next).not.toHaveBeenCalled();
    });

    // Cenário: Erro ao criar tarefa deve chamar next com erro
    it('deve chamar next em caso de erro', async () => {
      const error = new Error('fail');
      (TasksService.create as jest.Mock).mockRejectedValue(error);
      req.body = { title: 'Tarefa' };
      req.params = { projectId: '2' };
      await TasksController.create(req as any, res as any, next);
      expect(next).toHaveBeenCalledWith(error);
    });

    // Cenário: Body vazio ainda chama service (edge case)
    it('deve aceitar body vazio', async () => {
      (TasksService.create as jest.Mock).mockResolvedValue({ id: 2 });
      req.body = {};
      req.params = { projectId: '2' };
      await TasksController.create(req as any, res as any, next);
      expect(TasksService.create).toHaveBeenCalledWith(2, {});
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 2 });
    });

    // Cenário: projectId inválido (edge case)
    it('deve passar NaN para service se projectId inválido', async () => {
      (TasksService.create as jest.Mock).mockResolvedValue({ id: 3 });
      req.body = { title: 'Tarefa' };
      req.params = { projectId: 'abc' };
      await TasksController.create(req as any, res as any, next);
      expect(TasksService.create).toHaveBeenCalledWith(NaN, req.body);
    });
  });

  describe('update', () => {
    // Cenário: Atualização bem-sucedida retorna tarefa atualizada
    it('deve atualizar tarefa', async () => {
      (TasksService.update as jest.Mock).mockResolvedValue({ id: 1, title: 'Nova' });
      req.params = { id: '1' };
      req.body = { title: 'Nova' };
      await TasksController.update(req as any, res as any, next);
      expect(TasksService.update).toHaveBeenCalledWith(1, req.body);
      expect(res.json).toHaveBeenCalledWith({ id: 1, title: 'Nova' });
      expect(next).not.toHaveBeenCalled();
    });

    // Cenário: Erro ao atualizar tarefa chama next
    it('deve chamar next em caso de erro', async () => {
      const error = new Error('fail');
      (TasksService.update as jest.Mock).mockRejectedValue(error);
      req.params = { id: '1' };
      req.body = { title: 'Nova' };
      await TasksController.update(req as any, res as any, next);
      expect(next).toHaveBeenCalledWith(error);
    });

    // Cenário: Body vazio ainda chama service (edge case)
    it('deve aceitar body vazio', async () => {
      (TasksService.update as jest.Mock).mockResolvedValue({ id: 1 });
      req.params = { id: '1' };
      req.body = {};
      await TasksController.update(req as any, res as any, next);
      expect(TasksService.update).toHaveBeenCalledWith(1, {});
      expect(res.json).toHaveBeenCalledWith({ id: 1 });
    });

    // Cenário: id inválido (edge case)
    it('deve passar NaN para service se id inválido', async () => {
      (TasksService.update as jest.Mock).mockResolvedValue({ id: 2 });
      req.params = { id: 'abc' };
      req.body = { title: 'Nova' };
      await TasksController.update(req as any, res as any, next);
      expect(TasksService.update).toHaveBeenCalledWith(NaN, req.body);
    });
  });

  describe('remove', () => {
    // Cenário: Remoção bem-sucedida retorna 204
    it('deve remover tarefa', async () => {
      (TasksService.remove as jest.Mock).mockResolvedValue(undefined);
      req.params = { id: '1' };
      await TasksController.remove(req as any, res as any, next);
      expect(TasksService.remove).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    // Cenário: Erro ao remover tarefa chama next
    it('deve chamar next em caso de erro', async () => {
      const error = new Error('fail');
      (TasksService.remove as jest.Mock).mockRejectedValue(error);
      req.params = { id: '1' };
      await TasksController.remove(req as any, res as any, next);
      expect(next).toHaveBeenCalledWith(error);
    });

    // Cenário: id inválido (edge case)
    it('deve passar NaN para service se id inválido', async () => {
      (TasksService.remove as jest.Mock).mockResolvedValue(undefined);
      req.params = { id: 'abc' };
      await TasksController.remove(req as any, res as any, next);
      expect(TasksService.remove).toHaveBeenCalledWith(NaN);
    });
  });
});
