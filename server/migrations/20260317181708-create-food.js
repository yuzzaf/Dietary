"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Foods", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
      },
      calories: {
        type: Sequelize.FLOAT,
      },
      protein: {
        type: Sequelize.FLOAT,
      },
      fat: {
        type: Sequelize.FLOAT,
      },
      carbs: {
        type: Sequelize.FLOAT,
      },
      source: {
        type: Sequelize.STRING,
      },
      externalId: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addConstraint("Foods", {
      fields: ["source", "externalId"],
      type: "unique",
      name: "unique_food_source_externalId",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "Foods",
      "unique_food_source_externalId",
    );
    await queryInterface.dropTable("Foods");
  },
};
