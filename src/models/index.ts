import { Sequelize } from 'sequelize';

import { initProjectModel, Project } from './project';
import { initTaskModel, Task } from './task';

const {
  DB_HOST = 'localhost',
  DB_PORT = '3306',
  DB_USER = 'root',
  DB_PASSWORD,
  DB_NAME = 'projects_db',
  DB_LOGGING = 'false',
} = process.env;

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: Number(DB_PORT),
  dialect: 'mysql',
  logging: DB_LOGGING === 'true' ? console.log : false,
  define: {
    underscored: true,
    timestamps: true,
  },
});

initProjectModel(sequelize);
initTaskModel(sequelize);

Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks', onDelete: 'CASCADE' });
Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

export { Project, Task };
