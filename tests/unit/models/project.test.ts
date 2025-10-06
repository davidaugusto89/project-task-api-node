import { Project, initProjectModel } from '../../../src/models/project';

// ---- Mock do Sequelize: Model com construtor NO-OP e DataTypes espiados ----
jest.mock('sequelize', () => {
  // DataTypes spies (registram parâmetros usados no init)
  const STRING = jest.fn((len?: number) => ({ type: 'STRING', len }));
  const TEXT = jest.fn(() => ({ type: 'TEXT' }));
  const ENUM = jest.fn((...vals: string[]) => ({ type: 'ENUM', vals }));
  const JSON = jest.fn(() => ({ type: 'JSON' }));
  const DATE = jest.fn(() => ({ type: 'DATE' }));
  const INTEGER = {
    UNSIGNED: { type: 'INTEGER.UNSIGNED' },
  };
  const NOW = 'NOW';

  class MockModel {
    constructor(..._args: any[]) {} // no-op
    static init = jest.fn();
    static hasOne = jest.fn();
    static belongsTo = jest.fn();
    static hasMany = jest.fn();
    static belongsToMany = jest.fn();
  }

  const Sequelize = jest.fn(function SequelizeFake() {}) as any;

  return {
    Model: MockModel,
    DataTypes: { STRING, TEXT, ENUM, JSON, DATE, NOW, INTEGER },
    Sequelize,
  };
});

// reimport depois do mock para capturar DataTypes/Model/Sequelize fake
import { DataTypes, Sequelize, Model } from 'sequelize';

describe('Project model (POJO behavior)', () => {
  // Cenário: Instanciação simples sem tocar internals reais do Sequelize
  it('deve instanciar Project e acessar campos obrigatórios', () => {
    const p = new Project() as any;
    p.id = 1;
    p.name = 'Teste';
    p.status = 'active';
    p.createdAt = new Date();
    p.updatedAt = new Date();
    expect(p.id).toBe(1);
    expect(p.name).toBe('Teste');
    expect(p.status).toBe('active');
    expect(p.createdAt).toBeInstanceOf(Date);
    expect(p.updatedAt).toBeInstanceOf(Date);
  });

  it('deve permitir description e githubRepos nulos', () => {
    const p = new Project() as any;
    p.description = null;
    p.githubRepos = null;
    expect(p.description).toBeNull();
    expect(p.githubRepos).toBeNull();
  });

  it('deve permitir description e githubRepos preenchidos', () => {
    const p = new Project() as any;
    p.description = 'desc';
    p.githubRepos = { repo: 'test' };
    expect(p.description).toBe('desc');
    expect(p.githubRepos).toEqual({ repo: 'test' });
  });

  it('deve aceitar status archived', () => {
    const p = new Project() as any;
    p.status = 'archived';
    expect(p.status).toBe('archived');
  });
});

describe('initProjectModel (schema definition)', () => {
  let sequelize: Sequelize;

  beforeEach(() => {
    sequelize = new (Sequelize as any)();
    (Project.init as unknown as jest.Mock).mockClear();
    (DataTypes.STRING as jest.Mock).mockClear();
    (DataTypes.TEXT as jest.Mock).mockClear();
    (DataTypes.ENUM as jest.Mock).mockClear();
    (DataTypes.JSON as jest.Mock).mockClear();
    (DataTypes.DATE as jest.Mock).mockClear();
  });

  it('deve inicializar modelo com campos e opções corretas', () => {
    initProjectModel(sequelize);

    expect(Project.init).toHaveBeenCalledTimes(1);
    const [fields, options] = (Project.init as unknown as jest.Mock).mock.calls[0];

    // Campos presentes
    expect(fields).toHaveProperty('id');
    expect(fields).toHaveProperty('name');
    expect(fields).toHaveProperty('description');
    expect(fields).toHaveProperty('status');
    expect(fields).toHaveProperty('githubRepos');
    expect(fields).toHaveProperty('createdAt');
    expect(fields).toHaveProperty('updatedAt');

    // Opções principais
    expect(options).toMatchObject({
      tableName: 'projects',
      sequelize,
      modelName: 'Project',
      timestamps: true,
      underscored: true,
    });
  });

  it('deve usar DataTypes com parâmetros esperados', () => {
    initProjectModel(sequelize);

    expect(DataTypes.STRING).toHaveBeenCalledWith(120);
    expect(DataTypes.ENUM).toHaveBeenCalledWith('active', 'archived');
    expect(DataTypes.TEXT).toHaveBeenCalled();
    expect(DataTypes.JSON).toHaveBeenCalled();
    expect(DataTypes.DATE).toHaveBeenCalledTimes(2);
  });

  it('deve mapear githubRepos->github_repos e defaults corretos', () => {
    initProjectModel(sequelize);
    const [fields] = (Project.init as unknown as jest.Mock).mock.calls[0];

    expect(fields.githubRepos.field).toBe('github_repos');
    expect(fields.githubRepos.defaultValue).toBeNull();
    expect(fields.description.defaultValue).toBeNull();

    // status default
    expect(fields.status.defaultValue).toBe('active');

    // createdAt / updatedAt defaults
    expect(fields.createdAt.defaultValue).toBe(DataTypes.NOW);
    expect(fields.updatedAt.defaultValue).toBe(DataTypes.NOW);
  });

  it('deve expor apenas os valores permitidos no ENUM status', () => {
    initProjectModel(sequelize);
    expect((DataTypes.ENUM as jest.Mock).mock.calls[0][0]).toBe('active');
    expect((DataTypes.ENUM as jest.Mock).mock.calls[0][1]).toBe('archived');
    expect((DataTypes.ENUM as jest.Mock).mock.calls[0]).toHaveLength(2);
  });

  it('deve inicializar mesmo com sequelize undefined/null e suportar chamadas repetidas', () => {
    expect(() => initProjectModel(undefined as any)).not.toThrow();
    expect(() => initProjectModel(null as any)).not.toThrow();

    // chamada adicional com sequelize válido
    initProjectModel(sequelize);
    expect(Project.init).toHaveBeenCalled();
  });
});