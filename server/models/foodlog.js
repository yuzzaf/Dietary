'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FoodLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      FoodLog.belongsTo(models.User, { foreignKey: "user_id" });
      FoodLog.belongsTo(models.Food, { foreignKey: "food_id" });
      FoodLog.hasOne(models.FoodImage, { foreignKey: "food_log_id" });
    }
  }
  FoodLog.init({
    user_id: DataTypes.INTEGER,
    food_id: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    date: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'FoodLog',
  });
  return FoodLog;
};