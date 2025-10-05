import { Router } from 'express';

import { ProjectsController } from '../controllers/projects.controller';
import { validateRequest } from '../middlewares/validate';
import {
  createProjectValidation,
  updateProjectValidation,
  fetchGitHubReposValidation,
} from '../validations/project.validation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Projetos
 *   description: Endpoints relacionados a projetos
 */

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Cria um novo projeto
 *     tags: [Projetos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - status
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       201:
 *         description: Projeto criado com sucesso
 */
router.post('/projects', createProjectValidation, validateRequest, ProjectsController.create);

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Lista todos os projetos
 *     tags: [Projetos]
 *     responses:
 *       200:
 *         description: Lista de projetos retornada com sucesso
 */
router.get('/projects', ProjectsController.list);

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Retorna os dados de um projeto específico
 *     tags: [Projetos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do projeto
 *     responses:
 *       200:
 *         description: Dados do projeto retornados com sucesso
 */
router.get('/projects/:id', ProjectsController.get);

/**
 * @swagger
 * /projects/{id}:
 *   put:
 *     summary: Atualiza um projeto existente
 *     tags: [Projetos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do projeto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Projeto atualizado com sucesso
 */
router.put('/projects/:id', updateProjectValidation, validateRequest, ProjectsController.update);

/**
 * @swagger
 * /projects/{id}:
 *   delete:
 *     summary: Remove um projeto
 *     tags: [Projetos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do projeto
 *     responses:
 *       204:
 *         description: Projeto removido com sucesso
 */
router.delete('/projects/:id', ProjectsController.remove);

/**
 * @swagger
 * /projects/{id}/github/{username}:
 *   get:
 *     summary: Vincula os 5 últimos repositórios públicos de um usuário do GitHub ao projeto
 *     tags: [Projetos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do projeto
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome de usuário do GitHub
 *     responses:
 *       200:
 *         description: Repositórios vinculados com sucesso ao projeto
 */
router.get(
  '/projects/:id/github/:username',
  fetchGitHubReposValidation,
  validateRequest,
  ProjectsController.githubAttach,
);

export default router;
