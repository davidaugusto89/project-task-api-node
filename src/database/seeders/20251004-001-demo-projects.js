'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('projects', [
      {
        name: 'Projeto Alpha',
        description: 'Primeiro projeto demo',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Projeto Beta',
        description: 'Segundo projeto demo',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('projects', null, {});
  },
};
