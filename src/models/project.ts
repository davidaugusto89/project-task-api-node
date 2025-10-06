import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
  CreationOptional,
} from 'sequelize';

/**
 * Representa um repositório GitHub.
 */
export type GithubRepo = {
  id?: number;
  name: string;
  fullName?: string;
  url?: string;
  private?: boolean;
  [key: string]: unknown;
};

/**
 * Modelo Sequelize para projetos.
 * Representa um projeto cadastrado no sistema.
 *
 * @property {number} id - Identificador único do projeto.
 * @property {string} name - Nome do projeto.
 * @property {string|null} description - Descrição do projeto.
 * @property {'active'|'archived'} status - Status do projeto.
 * @property {GithubRepo[]|null} githubRepos - Repositórios GitHub associados ao projeto.
 * @property {Date} createdAt - Data de criação.
 * @property {Date} updatedAt - Data de atualização.
 *
 * @example
 * const projeto = await Project.create({ name: 'Novo Projeto', status: 'active' });
 */

export class Project extends Model<InferAttributes<Project>, InferCreationAttributes<Project>> {
  declare id: CreationOptional<number>;
  declare name: string;

  declare description: CreationOptional<string | null>;
  declare status: CreationOptional<'active' | 'archived'>;
  declare githubRepos: CreationOptional<GithubRepo[] | null>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

/**
 * Inicializa o modelo Project no Sequelize.
 *
 * @param {Sequelize} sequelize - Instância do Sequelize.
 * @returns {void}
 * @example
 * import { initProjectModel } from './project';
 * initProjectModel(sequelize);
 */

export const initProjectModel = (sequelize: Sequelize): void => {
  Project.init(
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(120), allowNull: false },

      // manter allowNull e (opcionalmente) defaultValue para refletir a optionalidade
      description: { type: DataTypes.TEXT(), allowNull: true, defaultValue: null },

      status: {
        type: DataTypes.ENUM('active', 'archived'),
        allowNull: false,
        defaultValue: 'active',
      },

      githubRepos: {
        type: DataTypes.JSON(),
        allowNull: true,
        field: 'github_repos',
        defaultValue: null,
      },

      createdAt: {
        type: DataTypes.DATE(),
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE(),
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updated_at',
      },
    },
    {
      sequelize,
      tableName: 'projects',
      modelName: 'Project',
      timestamps: true,
      underscored: true,
    },
  );
};
