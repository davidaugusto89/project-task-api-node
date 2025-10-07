'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'tasks',
      {
        id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
        project_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: { model: 'projects', key: 'id' },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        title: { type: Sequelize.STRING(160), allowNull: false },
        description: { type: Sequelize.TEXT, allowNull: true },
        status: {
          type: Sequelize.ENUM('pending', 'in_progress', 'done'),
          allowNull: false,
          defaultValue: 'pending',
        },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        },
      },
      {
        charset: 'utf8mb4',
        collate: 'utf8mb4_0900_ai_ci',
        engine: 'InnoDB',
      },
    );

    await queryInterface.addIndex('tasks', ['project_id', 'status']);
    await queryInterface.addConstraint('tasks', {
      fields: ['project_id', 'title'],
      type: 'unique',
      name: 'uq_tasks_project_title',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tasks');
  },
};
