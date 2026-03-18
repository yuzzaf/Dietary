const { Food, FoodLog } = require("../models");
const logger = require("../helpers/logger");

class LogController {
  // CREATE
  static async createLog(req, res, next) {
    try {
      const userId = req.user.id;

      const {
        name,
        calories,
        protein,
        fat,
        carbs,
        source,
        externalId,
        quantity,
        consumedAt,
      } = req.body;

      // find or create food
      const [food] = await Food.findOrCreate({
        where: {
          externalId,
          source,
        },
        defaults: {
          name,
          calories,
          protein,
          fat,
          carbs,
          source,
          externalId,
        },
      });

      const log = await FoodLog.create({
        userId,
        foodId: food.id,
        quantity: quantity || 1,
        consumedAt: consumedAt || new Date(),
      });

      res.status(201).json(log);
    } catch (err) {
      next(err);
      logger.error(err);
    }
  }

  // GET ALL
  static async getLogs(req, res, next) {
    try {
      const userId = req.user.id;

      const logs = await FoodLog.findAll({
        where: { userId },
        include: [{ model: Food }],
        order: [["consumedAt", "DESC"]],
      });

      res.json(logs);
    } catch (err) {
      next(err);
      logger.error(err);
    }
  }

  // DELETE
  static async deleteLog(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const log = await FoodLog.findOne({
        where: { id, userId },
      });

      if (!log) {
        throw { name: "NotFound", message: "Log not found" };
      }

      await log.destroy();

      res.json({ message: "Deleted" });
    } catch (err) {
      next(err);
      logger.error(err);
    }
  }
}

module.exports = LogController;
