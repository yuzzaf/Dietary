'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("AIInsights", "caloriesConsumed", {
      type: Sequelize.INTEGER,
    });
    await queryInterface.addColumn("AIInsights", "caloriesTarget", {
      type: Sequelize.INTEGER,
    });
    await queryInterface.addColumn("AIInsights", "status", {
      type: Sequelize.STRING,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("AIInsights", "caloriesConsumed");
    await queryInterface.removeColumn("AIInsights", "caloriesTarget");
    await queryInterface.removeColumn("AIInsights", "status");
  },
};
