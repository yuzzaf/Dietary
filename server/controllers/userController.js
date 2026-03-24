const { User } = require("../models");
const logger = require("../helpers/logger.js");
const cloudinary = require("../helpers/cloudinary.js");
const streamifier = require("streamifier");

class UserController {
  // GET PROFILE
  static async getProfile(req, res, next) {
    try {
      const userId = req.user.id;

      const user = await User.findByPk(userId, {
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        throw { name: "NotFound", message: "User not found" };
      }

      res.json(user);
    } catch (err) {
      next(err);
      logger.error(err);
    }
  }

  // UPDATE PROFILE
  static async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;

      const { weight, height, age, gender, activityLevel } = req.body;

      const user = await User.findByPk(userId);

      if (!user) {
        throw { name: "NotFound", message: "User not found" };
      }

      await user.update({
        weight,
        height,
        age,
        gender,
        activityLevel,
      });

      res.json({
        message: "Profile updated",
        user,
      });
    } catch (err) {
      next(err);
      logger.error(err);
    }
  }
  static async updateProfilePicture(req, res, next) {
    try {
      const userId = req.user.id;

      if (!req.file) {
        throw { name: "BadRequest", message: "Image is required" };
      }

      // upload pakai promise
      const uploadFromBuffer = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "profile_pictures" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            },
          );

          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });

      const result = await uploadFromBuffer();

      const user = await User.findByPk(userId);

      if (!user) {
        throw { name: "NotFound", message: "User not found" };
      }

      await user.update({
        profilePicture: result.secure_url,
      });

      res.json({
        message: "Profile picture updated",
        imageUrl: result.secure_url,
      });
    } catch (err) {
      next(err);
      logger.error(err);
    }
  }
}

module.exports = UserController;
