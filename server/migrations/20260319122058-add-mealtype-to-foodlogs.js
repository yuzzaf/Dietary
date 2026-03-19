'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("FoodLogs", "mealType", {
      type: Sequelize.ENUM("breakfast", "lunch", "dinner", "snack"),
      defaultValue: "snack",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("FoodLogs", "mealType");
    await queryInterface.sequelize.query('DROP TYPE "enum_FoodLogs_mealType";');
  },
};
