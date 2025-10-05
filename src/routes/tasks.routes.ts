import { Router } from 'express';

import { TasksController } from '../controllers/tasks.controller';
import { validateRequest } from '../middlewares/validate';
import {
  createTaskValidation,
  updateTaskValidation,
  deleteTaskValidation,
} from '../validations/task.validation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Tarefas
 *   description: Endpoints relacionados às tarefas dos projetos
 */

/**
 * @swagger
 * /projects/{projectId}/tasks:
 *   post:
 *     summary: Cria uma nova tarefa vinculada a um projeto
 *     tags: [Tarefas]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do projeto ao qual a tarefa será vinculada
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - status
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, done]
 *     responses:
 *       201:
 *         description: Tarefa criada com sucesso
 */
router.post(
  '/projects/:projectId/tasks',
  createTaskValidation,
  validateRequest,
  TasksController.create,
);

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Atualiza os dados de uma tarefa
 *     tags: [Tarefas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da tarefa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, done]
 *     responses:
 *       200:
 *         description: Tarefa atualizada com sucesso
 */
router.put('/tasks/:id', updateTaskValidation, validateRequest, TasksController.update);

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Remove uma tarefa
 *     tags: [Tarefas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da tarefa
 *     responses:
 *       204:
 *         description: Tarefa removida com sucesso
 */
router.delete('/tasks/:id', deleteTaskValidation, validateRequest, TasksController.remove);

export default router;
