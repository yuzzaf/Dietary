"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "weight", {
      type: Sequelize.FLOAT,
      allowNull: true,
    });

    await queryInterface.addColumn("Users", "height", {
      type: Sequelize.FLOAT,
      allowNull: true,
    });

    await queryInterface.addColumn("Users", "age", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn("Users", "gender", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("Users", "activityLevel", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users", "weight");
    await queryInterface.removeColumn("Users", "height");
    await queryInterface.removeColumn("Users", "age");
    await queryInterface.removeColumn("Users", "gender");
    await queryInterface.removeColumn("Users", "activityLevel");
  },
};
