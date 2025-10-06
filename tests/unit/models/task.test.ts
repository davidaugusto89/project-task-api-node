import { Task, initTaskModel } from '../../../src/models/task';

// ---- Mock do Sequelize: Model com construtor NO-OP e DataTypes espiados ----
jest.mock('sequelize', () => {
  const STRING = jest.fn((len?: number) => ({ type: 'STRING', len }));
  const TEXT = jest.fn(() => ({ type: 'TEXT' }));
  const ENUM = jest.fn((...vals: string[]) => ({ type: 'ENUM', vals }));
  const INTEGER = { UNSIGNED: true }; // usado em id / projectId
  const DATE = jest.fn(() => ({ type: 'DATE' }));
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
    DataTypes: { STRING, TEXT, ENUM, INTEGER, DATE, NOW },
    Sequelize,
  };
});

// reimport depois do mock para capturar DataTypes/Sequelize mockados
import { DataTypes, Sequelize } from 'sequelize';

describe('Task model (POJO)', () => {
  // Cenário: Instanciação simples e campos obrigatórios
  it('deve instanciar Task e acessar campos obrigatórios', () => {
    const t = new Task() as any;
    t.id = 1;
    t.projectId = 10;
    t.title = 'Nova tarefa';
    t.status = 'pending';
    t.createdAt = new Date();
    t.updatedAt = new Date();

    expect(t.id).toBe(1);
    expect(t.projectId).toBe(10);
    expect(t.title).toBe('Nova tarefa');
    expect(t.status).toBe('pending');
    expect(t.createdAt).toBeInstanceOf(Date);
    expect(t.updatedAt).toBeInstanceOf(Date);
  });

  // Cenário: Campos opcionais
  it('deve permitir description nulo e preenchido', () => {
    const a = new Task() as any;
    a.description = null;
    expect(a.description).toBeNull();

    const b = new Task() as any;
    b.description = 'detalhe';
    expect(b.description).toBe('detalhe');
  });

  // Cenário: Status válidos
  it('deve aceitar status in_progress e done', () => {
    const a = new Task() as any;
    a.status = 'in_progress';
    expect(a.status).toBe('in_progress');

    const b = new Task() as any;
    b.status = 'done';
    expect(b.status).toBe('done');
  });
});

describe('initTaskModel (schema)', () => {
  let sequelize: Sequelize;

  beforeEach(() => {
    sequelize = new (Sequelize as any)();
    (Task.init as unknown as jest.Mock).mockClear();
    (DataTypes.STRING as jest.Mock).mockClear?.();
    (DataTypes.TEXT as jest.Mock).mockClear?.();
    (DataTypes.ENUM as jest.Mock).mockClear?.();
    (DataTypes.DATE as jest.Mock).mockClear?.();
  });

  // Campos e opções básicas
  it('deve inicializar com campos e opções corretas', () => {
    initTaskModel(sequelize);

    expect(Task.init).toHaveBeenCalledTimes(1);
    const [fields, options] = (Task.init as unknown as jest.Mock).mock.calls[0];

    // Campos esperados
    expect(fields).toHaveProperty('id');
    expect(fields).toHaveProperty('projectId');
    expect(fields).toHaveProperty('title');
    expect(fields).toHaveProperty('description');
    expect(fields).toHaveProperty('status');
    expect(fields).toHaveProperty('createdAt');
    expect(fields).toHaveProperty('updatedAt');

    // Opções principais
    expect(options).toMatchObject({
      tableName: 'tasks',
      sequelize,
    });
  });

  // DataTypes chamados com parâmetros corretos
  it('deve usar DataTypes esperados', () => {
    initTaskModel(sequelize);

    const [fields] = (Task.init as unknown as jest.Mock).mock.calls[0];

    // title STRING(120) (aqui é função mesmo)
    expect(DataTypes.STRING as jest.Mock).toHaveBeenCalledWith(120);

    // description usa TEXT como valor (não é chamado)
    expect(fields.description.type).toBe(DataTypes.TEXT);

    // status é ENUM(...), esse sim é chamado
    expect(DataTypes.ENUM as jest.Mock).toHaveBeenCalledWith('pending', 'in_progress', 'done');

    // createdAt/updatedAt usam DATE como valor (não é chamado)
    expect(fields.createdAt.type).toBe(DataTypes.DATE);
    expect(fields.updatedAt.type).toBe(DataTypes.DATE);

    // (opcional) conferir INTEGER.UNSIGNED no projectId
    expect(fields.projectId.type).toBe(DataTypes.INTEGER.UNSIGNED);
  });

  // Mapeamentos snake_case, defaults etc.
  it('deve mapear projectId->project_id e ter default/status corretos', () => {
    initTaskModel(sequelize);
    const [fields] = (Task.init as unknown as jest.Mock).mock.calls[0];

    // mapeamentos
    expect(fields.projectId.field).toBe('project_id');
    expect(fields.createdAt.field).toBe('created_at');
    expect(fields.updatedAt.field).toBe('updated_at');

    // defaults
    expect(fields.status.defaultValue).toBe('pending');
  });

  // Edge cases: chamadas repetidas e sequelize ausente
  it('deve inicializar mesmo com sequelize undefined/null e suportar múltiplas chamadas', () => {
    expect(() => initTaskModel(undefined as any)).not.toThrow();
    expect(() => initTaskModel(null as any)).not.toThrow();

    initTaskModel(sequelize);
    expect(Task.init).toHaveBeenCalled();
  });
});
