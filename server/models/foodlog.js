"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class FoodLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      FoodLog.belongsTo(models.User, { foreignKey: "userId" });
      FoodLog.belongsTo(models.Food, { foreignKey: "foodId" });
      FoodLog.hasOne(models.FoodImage, { foreignKey: "foodLogId" });
    }
  }
  FoodLog.init(
    {
      userId: DataTypes.INTEGER,
      foodId: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER,
      consumedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "FoodLog",
    },
  );
  return FoodLog;
};
