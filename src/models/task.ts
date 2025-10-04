import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize';

/**
 * Modelo Sequelize para tarefas.
 * Representa uma tarefa associada a um projeto.
 *
 * @property {number} id - Identificador único da tarefa.
 * @property {number} projectId - ID do projeto ao qual a tarefa pertence.
 * @property {string} title - Título da tarefa.
 * @property {string|null} description - Descrição da tarefa.
 * @property {'pending'|'in_progress'|'done'} status - Status da tarefa.
 * @property {Date} createdAt - Data de criação.
 * @property {Date} updatedAt - Data de atualização.
 *
 * @example
 * const tarefa = await Task.create({ projectId: 1, title: 'Nova tarefa', status: 'pending' });
 */
export class Task extends Model<InferAttributes<Task>, InferCreationAttributes<Task>> {
  declare id: CreationOptional<number>;
  declare projectId: number;
  declare title: string;

  declare description: CreationOptional<string | null>;
  declare status: CreationOptional<'pending' | 'in_progress' | 'done'>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

/**
 * Inicializa o modelo Task no Sequelize.
 *
 * @param {Sequelize} sequelize - Instância do Sequelize.
 * @returns {void}
 *
 * @example
 * import { initTaskModel } from './task';
 * initTaskModel(sequelize);
 */
export const initTaskModel = (sequelize: Sequelize) => {
  Task.init(
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      projectId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'project_id' },
      title: { type: DataTypes.STRING(120), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      status: {
        type: DataTypes.ENUM('pending', 'in_progress', 'done'),
        allowNull: false,
        defaultValue: 'pending',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updated_at',
      },
    },
    {
      sequelize,
      tableName: 'tasks',
      modelName: 'Task',
      timestamps: true,
      underscored: true,
    },
  );
};
