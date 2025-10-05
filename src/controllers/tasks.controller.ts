import { Request, Response, NextFunction } from 'express';

import { TasksService } from '../services/tasks.service';

export const TasksController = {
  /**
   * Cria uma nova tarefa associada a um projeto.
   * @param {Request} req - Requisição Express contendo o ID do projeto em req.params.projectId e os dados da tarefa no body.
   * @param {Response} res - Resposta Express.
   * @param {NextFunction} next - Função para tratamento de erros.
   * @returns {Promise<void>} Retorna uma resposta HTTP 201 com a tarefa criada.
   * @throws {Error} Se ocorrer erro na criação da tarefa.
   * @example
   * // POST /projects/1/tasks { nome: 'Nova Tarefa' }
   */
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const task = await TasksService.create(Number(req.params.projectId), req.body);
      res.status(201).json(task);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Atualiza uma tarefa existente pelo ID.
   * @param {Request} req - Requisição Express contendo o ID da tarefa em req.params.id e dados no body.
   * @param {Response} res - Resposta Express.
   * @param {NextFunction} next - Função para tratamento de erros.
   * @returns {Promise<void>} Retorna uma resposta HTTP 200 com a tarefa atualizada.
   * @throws {Error} Se ocorrer erro na atualização da tarefa.
   * @example
   * // PUT /tasks/1 { nome: 'Tarefa Atualizada' }
   */
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const task = await TasksService.update(Number(req.params.id), req.body);
      res.json(task);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Remove uma tarefa pelo ID informado.
   * @param {Request} req - Requisição Express contendo o ID da tarefa em req.params.id.
   * @param {Response} res - Resposta Express.
   * @param {NextFunction} next - Função para tratamento de erros.
   * @returns {Promise<void>} Retorna uma resposta HTTP 204 sem conteúdo.
   * @throws {Error} Se ocorrer erro na remoção da tarefa.
   * @example
   * // DELETE /tasks/1
   */
  remove: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      await TasksService.remove(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
