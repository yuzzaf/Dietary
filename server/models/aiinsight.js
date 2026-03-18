"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AIInsight extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      AIInsight.belongsTo(models.User, { foreignKey: "userId" });
    }
  }
  AIInsight.init(
    {
      userId: DataTypes.INTEGER,
      date: DataTypes.DATE,
      content: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "AIInsight",
    },
  );
  return AIInsight;
};
