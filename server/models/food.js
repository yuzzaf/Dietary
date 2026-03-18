"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Food extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Food.hasMany(models.FoodLog, { foreignKey: "foodId" });
    }

    toJSON() {
      const obj = super.toJSON();
      delete obj.externalId;
      return obj;
    }
  }
  Food.init(
    {
      name: DataTypes.STRING,
      calories: DataTypes.FLOAT,
      protein: DataTypes.FLOAT,
      fat: DataTypes.FLOAT,
      carbs: DataTypes.FLOAT,
      source: DataTypes.STRING,
      externalId: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Food",
      tableName: "Foods",
    },
  );
  return Food;
};
