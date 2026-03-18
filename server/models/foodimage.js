"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class FoodImage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      FoodImage.belongsTo(models.User, { foreignKey: "userId" });
      FoodImage.belongsTo(models.FoodLog, { foreignKey: "foodLogId" });
    }
  }
  FoodImage.init(
    {
      userId: DataTypes.INTEGER,
      foodLogId: DataTypes.INTEGER,
      imageUrl: DataTypes.STRING,
      detectedName: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "FoodImage",
    },
  );
  return FoodImage;
};
