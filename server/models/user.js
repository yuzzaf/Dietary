"use strict";
const { hashPassword } = require("../helpers/bcrypt");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    get fullName() {
      return `${this.firstName || ""} ${this.lastName || ""}`.trim();
    }
    static associate(models) {
      User.hasMany(models.FoodLog, { foreignKey: "user_id" });
      User.hasMany(models.FoodImage, { foreignKey: "user_id" });
      User.hasOne(models.UserGoal, { foreignKey: "user_id" });
      User.hasMany(models.AIInsight, { foreignKey: "user_id" });
    }
  }
  User.init(
    {
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      google_id: DataTypes.STRING,
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      profile_picture: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
    },
  );

  User.beforeCreate(async (user) => {
    if (user.password) {
      user.password = await hashPassword(user.password);
    }
  });
  return User;
};
