'use strict';

module.exports = {
  async up(queryInterface) {
    // Assumindo que os dois primeiros projetos têm IDs 1 e 2
    await queryInterface.bulkInsert('tasks', [
      {
        project_id: 1,
        title: 'Configurar ambiente',
        description: 'Instalar deps',
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        project_id: 1,
        title: 'Criar models',
        description: null,
        status: 'in_progress',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        project_id: 2,
        title: 'Escrever README',
        description: null,
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('tasks', null, {});
  },
};
