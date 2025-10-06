import { body, param } from 'express-validator';

/**
 * Validações para criar e atualizar projetos.
 */
export const createProjectValidation = [
  body('name')
    .notEmpty()
    .withMessage('O nome do projeto é obrigatório.')
    .isString()
    .withMessage('O nome deve ser uma string.')
    .isLength({ max: 120 })
    .withMessage('O nome deve ter no máximo 120 caracteres.'),

  body('description')
    .notEmpty()
    .withMessage('A descrição é obrigatória.')
    .isString()
    .withMessage('A descrição deve ser um texto.'),

  body('status')
    .notEmpty()
    .withMessage('O status é obrigatório.')
    .isIn(['active', 'archived'])
    .withMessage('Status deve ser "active" ou "archived".'),
];

/**
 * Validações para atualizar projetos.
 */
export const updateProjectValidation = [
  param('id').isInt({ gt: 0 }).withMessage('O ID deve ser um número inteiro positivo.'),

  body('name')
    .optional()
    .isString()
    .withMessage('O nome deve ser uma string.')
    .isLength({ max: 120 })
    .withMessage('O nome deve ter no.maxcdn 120 caracteres.'),

  body('description').optional().isString().withMessage('A descrição deve ser um texto.'),

  body('status')
    .optional()
    .isIn(['active', 'archived'])
    .withMessage('Status deve ser "active" ou "archived".'),
];

/**
 * Validações para buscar repositórios do GitHub.
 */
export const fetchGitHubReposValidation = [
  param('id').isInt({ gt: 0 }).withMessage('O ID do projeto deve ser um número inteiro.'),

  param('username')
    .notEmpty()
    .withMessage('O nome de usuário do GitHub é obrigatório.')
    .isString()
    .withMessage('O nome de usuário deve ser uma string.'),
];

/**
 * Validações para deletar projetos.
 */
export const deleteProjectValidation = [
  param('id').isInt({ gt: 0 }).withMessage('O ID do projeto deve ser um número inteiro.'),
];
