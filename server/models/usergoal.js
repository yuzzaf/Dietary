"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserGoal extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      UserGoal.belongsTo(models.User, { foreignKey: "userId" });
    }
  }
  UserGoal.init(
    {
      userId: DataTypes.INTEGER,
      goalType: DataTypes.STRING,
      targetCalories: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "UserGoal",
    },
  );
  return UserGoal;
};
