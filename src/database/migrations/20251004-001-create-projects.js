'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'projects',
      {
        id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
        name: { type: Sequelize.STRING(120), allowNull: false },
        description: { type: Sequelize.TEXT, allowNull: true },
        status: {
          type: Sequelize.ENUM('active', 'archived'),
          allowNull: false,
          defaultValue: 'active',
        },
        github_repos: { type: Sequelize.JSON, allowNull: true },
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

    await queryInterface.addIndex('projects', ['id'], { unique: true });
    await queryInterface.addIndex('projects', ['name']);
    await queryInterface.addIndex('projects', ['status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('projects');
  },
};
