import { execSync } from 'node:child_process';

module.exports = async () => {
  process.env.NODE_ENV = 'test';
  process.env.DB_NAME = process.env.DB_NAME ? `${process.env.DB_NAME}_test` : 'projects_db_test';

  try {
    execSync('npx sequelize-cli db:migrate --env test', { stdio: 'inherit' });
  } catch (e) {
    console.error('Falha ao rodar migrations de teste', e);
    throw e;
  }
};
