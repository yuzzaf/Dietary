'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Food extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Food.hasMany(models.FoodLog, { foreignKey: "food_id" });
    }
  }
  Food.init({
    name: DataTypes.STRING,
    calories: DataTypes.FLOAT,
    protein: DataTypes.FLOAT,
    fat: DataTypes.FLOAT,
    carbs: DataTypes.FLOAT,
    source: DataTypes.STRING,
    external_id: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Food',
  });
  return Food;
};