import { Sequelize } from 'sequelize';

// Mocka dependências
jest.mock('../../../src/models/project', () => ({
  initProjectModel: jest.fn(),
  Project: { hasMany: jest.fn() },
}));

jest.mock('../../../src/models/task', () => ({
  initTaskModel: jest.fn(),
  Task: { belongsTo: jest.fn() },
}));

describe('models/index', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('deve inicializar Sequelize com configs do env', () => {
    process.env.DB_HOST = 'meu-host';
    process.env.DB_PORT = '1234';
    process.env.DB_USER = 'user';
    process.env.DB_PASSWORD = 'senha';
    process.env.DB_NAME = 'meu_db';
    process.env.DB_LOGGING = 'false';

    const { sequelize } = require('../../../src/models');

    expect(sequelize.constructor.name).toBe('Sequelize');
    expect(sequelize.options.host).toBe('meu-host');
    expect(sequelize.options.port).toBe(1234);
    expect(sequelize.config.database).toBe('meu_db');
  });

  it('deve chamar initProjectModel e initTaskModel com sequelize', () => {
    const { sequelize } = require('../../../src/models');
    const { initProjectModel } = require('../../../src/models/project');
    const { initTaskModel } = require('../../../src/models/task');

    expect(initProjectModel).toHaveBeenCalledWith(sequelize);
    expect(initTaskModel).toHaveBeenCalledWith(sequelize);
  });

  it('deve configurar associações entre Project e Task', () => {
    const { Project } = require('../../../src/models/project');
    const { Task } = require('../../../src/models/task');

    // importa para rodar os side-effects (associações)
    require('../../../src/models');

    expect(Project.hasMany).toHaveBeenCalledWith(Task, {
      foreignKey: 'projectId',
      as: 'tasks',
      onDelete: 'CASCADE',
    });

    expect(Task.belongsTo).toHaveBeenCalledWith(Project, {
      foreignKey: 'projectId',
      as: 'project',
    });
  });
});
