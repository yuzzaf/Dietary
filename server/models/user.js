"use strict";
const { hashPassword } = require("../helpers/bcrypt");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    get fullName() {
      return `${this.firstName || ""} ${this.lastName || ""}`.trim();
    }
    static associate(models) {
      User.hasMany(models.FoodLog, { foreignKey: "userId" });
      User.hasMany(models.FoodImage, { foreignKey: "userId" });
      User.hasOne(models.UserGoal, { foreignKey: "userId" });
      User.hasMany(models.AIInsight, { foreignKey: "userId" });
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
      googleId: DataTypes.STRING,
      githubId: DataTypes.STRING,
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
      profilePicture: DataTypes.STRING,
      weight: DataTypes.FLOAT,
      height: DataTypes.FLOAT,
      age: DataTypes.INTEGER,
      gender: DataTypes.STRING,
      activityLevel: DataTypes.STRING,
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
