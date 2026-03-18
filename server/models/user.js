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
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            msg: "Email is not valid",
          },
          notEmpty: {
            msg: "Email is required",
          },
          notNull: {
            msg: "Email is required",
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [6, 255],
            msg: "Password must be at least 6 characters",
          },
          notEmpty: {
            msg: "Password is required",
          },
          notNull: {
            msg: "Password is required",
          },
        },
      },
      google_id: DataTypes.STRING,
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "First name is required",
          },
          notNull: {
            msg: "First name is required",
          },
        },
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Last name is required",
          },
          notNull: {
            msg: "Last name is required",
          },
        },
      },
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
