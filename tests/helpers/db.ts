import { sequelize } from '../../src/models';

/**
 * Trunca todas as tabelas registradas no Sequelize (MySQL).
 * - Desabilita FOREIGN_KEY_CHECKS para não precisar de ordem.
 * - Reseta AUTO_INCREMENT automaticamente (TRUNCATE).
 * - Usa destroy({ truncate: true, restartIdentity: true, cascade: true }) para models.
 */
export async function truncateAll() {
  // Desliga checagem de FKs
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

  // 1) Trunca tabelas conhecidas via models
  const models = Object.values(sequelize.models);
  for (const model of models) {
    await (model as any).destroy({
      where: {},
      truncate: true,
      force: true,
      restartIdentity: true,
      cascade: true,
    });
  }

  // Religa checagem de FKs
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
}

/** Fecha o pool de conexões (útil em teardown global do Jest). */
export async function closeDb() {
  await sequelize.close();
}
