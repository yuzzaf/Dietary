'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FoodImage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      FoodImage.belongsTo(models.User, { foreignKey: "user_id" });
      FoodImage.belongsTo(models.FoodLog, { foreignKey: "food_log_id" });
    }
  }
  FoodImage.init({
    user_id: DataTypes.INTEGER,
    food_log_id: DataTypes.INTEGER,
    image_url: DataTypes.STRING,
    detected_name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'FoodImage',
  });
  return FoodImage;
};