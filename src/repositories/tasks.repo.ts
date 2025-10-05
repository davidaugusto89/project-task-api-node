import { Attributes, CreationAttributes } from 'sequelize';

import { Task } from '../models/task';

export const TasksRepo = {
  /**
   * Cria uma nova tarefa.
   * @param {CreationAttributes<Task>} data - Dados da tarefa.
   * @returns {Promise<Task>} Tarefa criada.
   * @example
   * await TasksRepo.create({ projectId: 1, title: 'Nova tarefa', status: 'pending' });
   */
  create: (data: CreationAttributes<Task>): Promise<Task> => Task.create(data),

  /**
   * Atualiza uma tarefa pelo ID.
   * @param {number} id - ID da tarefa a ser atualizada.
   * @param {Partial<Attributes<Task>>} data - Dados para atualização.
   * @returns {Promise<Task|null>} Tarefa atualizada ou null se não encontrada.
   * @throws {Error} Se ocorrer erro na atualização.
   * @example
   * await TasksRepo.updateById(1, { title: 'Tarefa Editada' });
   */
  updateById: async (id: number, data: Partial<Attributes<Task>>): Promise<Task | null> => {
    const task = await Task.findByPk(id);
    if (!task) return null;
    return task.update(data);
  },

  /**
   * Remove uma tarefa pelo ID.
   * @param {number} id - ID da tarefa a ser removida.
   * @returns {Promise<number>} Número de registros removidos (0 ou 1).
   * @example
   * await TasksRepo.deleteById(1);
   */
  deleteById: (id: number): Promise<number> => Task.destroy({ where: { id } }),

  /**
   * Busca uma tarefa pelo ID.
   * @param {number} id - ID da tarefa.
   * @returns {Promise<Task|null>} Tarefa encontrada ou null se não existir.
   * @example
   * await TasksRepo.findById(1);
   */
  findById: (id: number): Promise<Task | null> => Task.findByPk(id),
};
