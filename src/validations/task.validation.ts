import { body, param } from 'express-validator';

/**
 * Validações para criar e atualizar tarefas.
 *
 * @see {@link https://express-validator.github.io/docs/}
 */
export const createTaskValidation = [
  param('projectId')
    .isInt({ gt: 0 })
    .withMessage('O ID do projeto deve ser um número inteiro positivo.'),

  body('title')
    .notEmpty()
    .withMessage('O título da tarefa é obrigatório.')
    .isString()
    .withMessage('O título deve ser uma string.')
    .isLength({ max: 120 })
    .withMessage('O título pode ter no máximo 120 caracteres.'),

  body('description')
    .notEmpty()
    .withMessage('A descrição é obrigatória.')
    .isString()
    .withMessage('A descrição deve ser um texto.'),

  body('status')
    .notEmpty()
    .withMessage('O status da tarefa é obrigatório.')
    .isIn(['pending', 'in_progress', 'done'])
    .withMessage('Status deve ser "pending", "in_progress" ou "done".'),
];

/**
 * Validações para atualizar tarefas.
 *
 * @see {@link https://express-validator.github.io/docs/}
 */
export const updateTaskValidation = [
  param('id').isInt({ gt: 0 }).withMessage('O ID da tarefa deve ser um número inteiro positivo.'),

  body('title')
    .optional()
    .isString()
    .withMessage('O título deve ser uma string.')
    .isLength({ max: 120 })
    .withMessage('O título pode ter no máximo 120 caracteres.'),

  body('description').optional().isString().withMessage('A descrição deve ser um texto.'),

  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'done'])
    .withMessage('Status deve ser "pending", "in_progress" ou "done".'),
];

/**
 * Validações para deletar tarefas.
 *
 * @see {@link https://express-validator.github.io/docs/}
 */
export const deleteTaskValidation = [
  param('id').isInt({ gt: 0 }).withMessage('O ID da tarefa deve ser um número inteiro positivo.'),
];
