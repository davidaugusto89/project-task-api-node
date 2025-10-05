import { ProjectsRepo } from '../repositories/projects.repo';
import { TasksRepo } from '../repositories/tasks.repo';

export const TasksService = {
  /**
   * Cria uma nova tarefa associada a um projeto.
   * @param {number} projectId - ID do projeto ao qual a tarefa será vinculada.
   * @param {{ title: string; description?: string | null | undefined; status?: any }} payload - Dados da tarefa.
   * @returns {Promise<Task>} Tarefa criada.
   * @throws {Error} Se o projeto não for encontrado.
   * @example
   * await TasksService.create(1, { title: 'Nova tarefa', status: 'pending' });
   */
  async create(
    projectId: number,
    payload: {
      title: string;
      description?: string | null | undefined;
      status?: 'pending' | 'in_progress' | 'done';
    },
  ): Promise<unknown> {
    const project = await ProjectsRepo.findById(projectId);
    if (!project) {
      throw Object.assign(new Error('Projeto não encontrado'), { status: 404 });
    }

    return TasksRepo.create({ ...payload, projectId });
  },

  /**
   * Atualiza uma tarefa existente pelo ID.
   * @param {number} id - ID da tarefa a ser atualizada.
   * @param {{ title?: string; description?: string | null; status?: any }} payload - Dados para atualização.
   * @returns {Promise<Task>} Tarefa atualizada.
   * @throws {Error} Se a tarefa não for encontrada.
   * @example
   * await TasksService.update(1, { title: 'Tarefa editada' });
   */
  async update(id: number, payload: Partial<unknown>): Promise<unknown> {
    const updated = await TasksRepo.updateById(id, payload);
    if (!updated) {
      throw Object.assign(new Error('Task not found'), { status: 404 });
    }
    return updated;
  },

  /**
   * Remove uma tarefa pelo ID informado.
   * @param {number} id - ID da tarefa a ser removida.
   * @returns {Promise<void>} Resolve se a tarefa for removida.
   * @throws {Error} Se a tarefa não for encontrada.
   * @example
   * await TasksService.remove(1);
   */
  async remove(id: number): Promise<void> {
    const deleted = await TasksRepo.deleteById(id);
    if (deleted > 0) return;
    throw Object.assign(new Error('Task not found'), { status: 404 });
  },
};
