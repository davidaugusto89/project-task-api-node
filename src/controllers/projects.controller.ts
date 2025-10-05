import { Request, Response, NextFunction } from 'express';

import { GitHubService } from '../services/github.service';
import { ProjectsService } from '../services/projects.service';

export const ProjectsController = {
  /**
   * Cria um novo projeto.
   * @param {Request} req - Requisição Express contendo os dados do projeto no body.
   * @param {Response} res - Resposta Express.
   * @param {NextFunction} next - Função para tratamento de erros.
   * @returns {Promise<void>} Retorna uma resposta HTTP 201 com o projeto criado.
   * @throws {Error} Se ocorrer erro na criação do projeto.
   * @example
   * // POST /projects { nome: 'Novo Projeto' }
   */
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const project = await ProjectsService.create(req.body);
      res.status(201).json(project);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Lista todos os projetos cadastrados.
   * @param {Request} _req - Requisição Express (não utilizada).
   * @param {Response} res - Resposta Express.
   * @param {NextFunction} next - Função para tratamento de erros.
   * @returns {Promise<void>} Retorna uma resposta HTTP 200 com a lista de projetos.
   * @throws {Error} Se ocorrer erro na listagem dos projetos.
   * @example
   * // GET /projects
   */
  list: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const projects = await ProjectsService.list();
      res.json(projects);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Busca um projeto pelo ID informado.
   * @param {Request} req - Requisição Express contendo o ID em req.params.id.
   * @param {Response} res - Resposta Express.
   * @param {NextFunction} next - Função para tratamento de erros.
   * @returns {Promise<void>} Retorna uma resposta HTTP 200 com o projeto encontrado.
   * @throws {Error} Se o projeto não for encontrado ou ocorrer erro na busca.
   * @example
   * // GET /projects/1
   */
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const project = await ProjectsService.get(Number(req.params.id));
      res.json(project);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Atualiza um projeto existente pelo ID.
   * @param {Request} req - Requisição Express contendo o ID em req.params.id e dados no body.
   * @param {Response} res - Resposta Express.
   * @param {NextFunction} next - Função para tratamento de erros.
   * @returns {Promise<void>} Retorna uma resposta HTTP 200 com o projeto atualizado.
   * @throws {Error} Se ocorrer erro na atualização do projeto.
   * @example
   * // PUT /projects/1 { nome: 'Projeto Atualizado' }
   */
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const project = await ProjectsService.update(Number(req.params.id), req.body);
      res.json(project);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Remove um projeto pelo ID informado.
   * @param {Request} req - Requisição Express contendo o ID em req.params.id.
   * @param {Response} res - Resposta Express.
   * @param {NextFunction} next - Função para tratamento de erros.
   * @returns {Promise<void>} Retorna uma resposta HTTP 204 sem conteúdo.
   * @throws {Error} Se ocorrer erro na remoção do projeto.
   * @example
   * // DELETE /projects/1
   */
  remove: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      await ProjectsService.remove(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  /**
   * Associa dados do GitHub ao projeto informado.
   * @param {Request} req - Requisição Express contendo o ID do projeto e o username do GitHub em req.params.
   * @param {Response} res - Resposta Express.
   * @param {NextFunction} next - Função para tratamento de erros.
   * @returns {Promise<void>} Retorna uma resposta HTTP 200 com os dados do GitHub associados.
   * @throws {Error} Se o parâmetro username estiver ausente ou ocorrer erro na associação.
   * @example
   * // POST /projects/1/githubAttach/davidaugusto89
   */
  githubAttach: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const username = req.params.username as string;
      if (!username) {
        throw Object.assign(new Error('Param "username" é obrigatório'), { status: 400 });
      }
      const result = await GitHubService.fetchAndAttach(id, username);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};
