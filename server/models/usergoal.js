'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserGoal extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      UserGoal.belongsTo(models.User, { foreignKey: "user_id" });
    }
  }
  UserGoal.init({
    user_id: DataTypes.INTEGER,
    goal_type: DataTypes.STRING,
    target_calories: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'UserGoal',
  });
  return UserGoal;
};