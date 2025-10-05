import { ProjectsRepo } from '../repositories/projects.repo';

export const ProjectsService = {
  /**
   * Cria um novo projeto.
   * @param {{ name: string; description?: string | null | undefined; status?: 'active' | 'archived' }} payload - Dados do projeto.
   * @returns {Promise<Project>} Projeto criado.
   * @example
   * await ProjectsService.create({ name: 'Novo Projeto', status: 'active' });
   */
  create: (payload: {
    name: string;
    description?: string | null | undefined;
    status?: 'active' | 'archived';
  }): Promise<unknown> => ProjectsRepo.create(payload),

  /**
   * Lista todos os projetos cadastrados.
   * @returns {Promise<Project[]>} Lista de projetos.
   * @example
   * await ProjectsService.list();
   */
  list: (): Promise<unknown[]> => ProjectsRepo.findAll(),

  /**
   * Busca um projeto pelo ID informado.
   * @param {number} id - ID do projeto.
   * @returns {Promise<Project>} Projeto encontrado.
   * @throws {Error} Se o projeto não for encontrado.
   * @example
   * await ProjectsService.get(1);
   */
  get: async (id: number): Promise<unknown> => {
    const project = await ProjectsRepo.findById(id);
    if (!project) throw Object.assign(new Error('Projeto não encontrado'), { status: 404 });
    return project;
  },

  /**
   * Atualiza um projeto existente pelo ID.
   * @param {number} id - ID do projeto a ser atualizado.
   * @param {Partial<Project>} payload - Dados para atualização.
   * @returns {Promise<Project>} Projeto atualizado.
   * @throws {Error} Se o projeto não for encontrado.
   * @example
   * await ProjectsService.update(1, { name: 'Projeto Editado' });
   */
  update: async (id: number, payload: Partial<unknown>): Promise<unknown> => {
    const updated = await ProjectsRepo.updateById(id, payload);
    if (!updated) throw Object.assign(new Error('Projeto não encontrado'), { status: 404 });
    return updated;
  },

  /**
   * Remove um projeto pelo ID informado.
   * @param {number} id - ID do projeto a ser removido.
   * @returns {Promise<void>} Resolve se o projeto for removido.
   * @throws {Error} Se o projeto não for encontrado.
   * @example
   * await ProjectsService.remove(1);
   */
  remove: async (id: number): Promise<void> => {
    const deleted = await ProjectsRepo.deleteById(id);
    if (deleted > 0) return;
    throw Object.assign(new Error('Projeto não encontrado'), { status: 404 });
  },
};
