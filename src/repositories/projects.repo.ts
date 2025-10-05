import { CreationAttributes, FindOptions, Attributes } from 'sequelize';

import { Project } from '../models/project';
import { Task } from '../models/task';

export const ProjectsRepo = {
  /**
   * Cria um novo projeto.
   * @param {CreationAttributes<Project>} data - Dados do projeto.
   * @returns {Promise<Project>} Projeto criado.
   * @example
   * await ProjectsRepo.create({ name: 'Novo Projeto', status: 'active' });
   */
  create: (data: CreationAttributes<Project>): Promise<Project> => Project.create(data),

  /**
   * Busca todos os projetos, incluindo suas tarefas.
   * @param {FindOptions} [options] - Opções de busca do Sequelize.
   * @returns {Promise<Project[]>} Lista de projetos encontrados.
   * @example
   * await ProjectsRepo.findAll({ where: { status: 'active' } });
   */
  findAll: (options: FindOptions = {}): Promise<Project[]> =>
    Project.findAll({ include: [{ model: Task, as: 'tasks' }], ...options }),

  /**
   * Busca um projeto pelo ID, incluindo suas tarefas.
   * @param {number} id - ID do projeto.
   * @returns {Promise<Project|null>} Projeto encontrado ou null se não existir.
   * @example
   * await ProjectsRepo.findById(1);
   */
  findById: (id: number): Promise<Project | null> =>
    Project.findByPk(id, { include: [{ model: Task, as: 'tasks' }] }),

  /**
   * Atualiza um projeto pelo ID.
   * @param {number} id - ID do projeto a ser atualizado.
   * @param {Partial<Attributes<Project>>} data - Dados para atualização.
   * @returns {Promise<Project|null>} Projeto atualizado ou null se não encontrado.
   * @throws {Error} Se ocorrer erro na atualização.
   * @example
   * await ProjectsRepo.updateById(1, { name: 'Projeto Editado' });
   */
  updateById: async (id: number, data: Partial<Attributes<Project>>): Promise<Project | null> => {
    const project = await Project.findByPk(id);
    if (!project) return null;
    return project.update(data);
  },

  /**
   * Remove um projeto pelo ID.
   * @param {number} id - ID do projeto a ser removido.
   * @returns {Promise<number>} Número de registros removidos (0 ou 1).
   * @example
   * await ProjectsRepo.deleteById(1);
   */
  deleteById: (id: number): Promise<number> => Project.destroy({ where: { id } }),
};
