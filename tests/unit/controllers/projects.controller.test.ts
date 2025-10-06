import { ProjectsController } from '../../../src/controllers/projects.controller';
import { GitHubService } from '../../../src/services/github.service';
import { ProjectsService } from '../../../src/services/projects.service';

jest.mock('../../../src/services/projects.service');
jest.mock('../../../src/services/github.service');

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

describe('ProjectsController', () => {
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
    // Cenário: Criação de projeto bem-sucedida retorna status 201 e o projeto criado
    it('deve criar projeto e retornar 201', async () => {
      (ProjectsService.create as jest.Mock).mockResolvedValue({ id: 1, name: 'Projeto' });
      req.body = { name: 'Projeto' };
      await ProjectsController.create(req as any, res as any, next);
      expect(ProjectsService.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 1, name: 'Projeto' });
      expect(next).not.toHaveBeenCalled();
    });

    // Cenário: Erro ao criar projeto deve chamar next com erro
    it('deve chamar next em caso de erro', async () => {
      const error = new Error('fail');
      (ProjectsService.create as jest.Mock).mockRejectedValue(error);
      await ProjectsController.create(req as any, res as any, next);
      expect(next).toHaveBeenCalledWith(error);
    });

    // Cenário: Corpo vazio ainda chama service (edge case)
    it('deve aceitar body vazio', async () => {
      (ProjectsService.create as jest.Mock).mockResolvedValue({ id: 2 });
      req.body = {};
      await ProjectsController.create(req as any, res as any, next);
      expect(ProjectsService.create).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 2 });
    });
  });

  describe('list', () => {
    // Cenário: Listagem bem-sucedida retorna lista de projetos
    it('deve listar projetos', async () => {
      (ProjectsService.list as jest.Mock).mockResolvedValue([{ id: 1 }]);
      await ProjectsController.list(req as any, res as any, next);
      expect(ProjectsService.list).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
      expect(next).not.toHaveBeenCalled();
    });

    // Cenário: Erro ao listar projetos deve chamar next
    it('deve chamar next em caso de erro', async () => {
      const error = new Error('fail');
      (ProjectsService.list as jest.Mock).mockRejectedValue(error);
      await ProjectsController.list(req as any, res as any, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('get', () => {
    // Cenário: Busca de projeto por ID retorna projeto
    it('deve retornar projeto pelo id', async () => {
      (ProjectsService.get as jest.Mock).mockResolvedValue({ id: 1 });
      req.params = { id: '1' };
      await ProjectsController.get(req as any, res as any, next);
      expect(ProjectsService.get).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({ id: 1 });
      expect(next).not.toHaveBeenCalled();
    });

    // Cenário: Erro ao buscar projeto chama next
    it('deve chamar next em caso de erro', async () => {
      const error = new Error('not found');
      (ProjectsService.get as jest.Mock).mockRejectedValue(error);
      req.params = { id: '1' };
      await ProjectsController.get(req as any, res as any, next);
      expect(next).toHaveBeenCalledWith(error);
    });

    // Cenário: ID inválido (edge case)
    it('deve passar NaN para service se id inválido', async () => {
      (ProjectsService.get as jest.Mock).mockResolvedValue(null);
      req.params = { id: 'abc' };
      await ProjectsController.get(req as any, res as any, next);
      expect(ProjectsService.get).toHaveBeenCalledWith(NaN);
    });
  });

  describe('update', () => {
    // Cenário: Atualização bem-sucedida retorna projeto atualizado
    it('deve atualizar projeto', async () => {
      (ProjectsService.update as jest.Mock).mockResolvedValue({ id: 1, name: 'Novo' });
      req.params = { id: '1' };
      req.body = { name: 'Novo' };
      await ProjectsController.update(req as any, res as any, next);
      expect(ProjectsService.update).toHaveBeenCalledWith(1, req.body);
      expect(res.json).toHaveBeenCalledWith({ id: 1, name: 'Novo' });
      expect(next).not.toHaveBeenCalled();
    });

    // Cenário: Erro ao atualizar projeto chama next
    it('deve chamar next em caso de erro', async () => {
      const error = new Error('fail');
      (ProjectsService.update as jest.Mock).mockRejectedValue(error);
      req.params = { id: '1' };
      req.body = { name: 'Novo' };
      await ProjectsController.update(req as any, res as any, next);
      expect(next).toHaveBeenCalledWith(error);
    });

    // Cenário: Body vazio ainda chama service (edge case)
    it('deve aceitar body vazio', async () => {
      (ProjectsService.update as jest.Mock).mockResolvedValue({ id: 1 });
      req.params = { id: '1' };
      req.body = {};
      await ProjectsController.update(req as any, res as any, next);
      expect(ProjectsService.update).toHaveBeenCalledWith(1, {});
      expect(res.json).toHaveBeenCalledWith({ id: 1 });
    });
  });

  describe('remove', () => {
    // Cenário: Remoção bem-sucedida retorna 204
    it('deve remover projeto', async () => {
      (ProjectsService.remove as jest.Mock).mockResolvedValue(undefined);
      req.params = { id: '1' };
      await ProjectsController.remove(req as any, res as any, next);
      expect(ProjectsService.remove).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    // Cenário: Erro ao remover projeto chama next
    it('deve chamar next em caso de erro', async () => {
      const error = new Error('fail');
      (ProjectsService.remove as jest.Mock).mockRejectedValue(error);
      req.params = { id: '1' };
      await ProjectsController.remove(req as any, res as any, next);
      expect(next).toHaveBeenCalledWith(error);
    });

    // Cenário: ID inválido (edge case)
    it('deve passar NaN para service se id inválido', async () => {
      (ProjectsService.remove as jest.Mock).mockResolvedValue(undefined);
      req.params = { id: 'abc' };
      await ProjectsController.remove(req as any, res as any, next);
      expect(ProjectsService.remove).toHaveBeenCalledWith(NaN);
    });
  });

  describe('githubAttach', () => {
    // Cenário: Associação ao GitHub bem-sucedida retorna dados
    it('deve associar dados do github ao projeto', async () => {
      (GitHubService.fetchAndAttach as jest.Mock).mockResolvedValue({ ok: true });
      req.params = { id: '1', username: 'user' };
      await ProjectsController.githubAttach(req as any, res as any, next);
      expect(GitHubService.fetchAndAttach).toHaveBeenCalledWith(1, 'user');
      expect(res.json).toHaveBeenCalledWith({ ok: true });
      expect(next).not.toHaveBeenCalled();
    });

    // Cenário: Falta username deve lançar erro 400
    it('deve lançar erro se username ausente', async () => {
      req.params = { id: '1' };
      await ProjectsController.githubAttach(req as any, res as any, next);
      expect(next).toHaveBeenCalled();
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(Error);
      expect(err.status).toBe(400);
    });

    // Cenário: Erro ao associar github chama next
    it('deve chamar next em caso de erro', async () => {
      const error = new Error('fail');
      (GitHubService.fetchAndAttach as jest.Mock).mockRejectedValue(error);
      req.params = { id: '1', username: 'user' };
      await ProjectsController.githubAttach(req as any, res as any, next);
      expect(next).toHaveBeenCalledWith(error);
    });

    // Cenário: ID inválido (edge case)
    it('deve passar NaN para service se id inválido', async () => {
      (GitHubService.fetchAndAttach as jest.Mock).mockResolvedValue({ ok: true });
      req.params = { id: 'abc', username: 'user' };
      await ProjectsController.githubAttach(req as any, res as any, next);
      expect(GitHubService.fetchAndAttach).toHaveBeenCalledWith(NaN, 'user');
    });
  });
});
