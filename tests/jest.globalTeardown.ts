import { execSync } from 'node:child_process';

module.exports = async () => {
  try {
    execSync('npx sequelize-cli db:migrate:undo:all --env test', { stdio: 'inherit' });
  } catch (e) {
    console.error('Falha ao desfazer migrations de teste', e);
  }
};
