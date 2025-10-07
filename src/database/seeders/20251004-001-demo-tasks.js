'use strict';

module.exports = {
  async up(queryInterface) {
    const t = await queryInterface.sequelize.transaction();
    try {
      const [projects] = await queryInterface.sequelize.query(
        `SELECT id, name FROM projects WHERE name IN ('Projeto Alpha','Projeto Beta')`,
        { transaction: t },
      );

      const alpha = projects.find((p) => p.name === 'Projeto Alpha')?.id;
      const beta = projects.find((p) => p.name === 'Projeto Beta')?.id;

      await queryInterface.bulkInsert(
        'tasks',
        [
          {
            project_id: alpha,
            title: 'Configurar ambiente',
            description: 'Instalar deps',
            status: 'pending',
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            project_id: alpha,
            title: 'Criar modelos',
            description: null,
            status: 'in_progress',
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            project_id: beta,
            title: 'Escrever README',
            description: null,
            status: 'pending',
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
        { transaction: t },
      );

      await t.commit();
    } catch (e) {
      await t.rollback();
      throw e;
    }
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('tasks', null, {});
  },
};
