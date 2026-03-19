const { Food, FoodLog, AIInsight } = require("../models");
const { Op } = require("sequelize");
const logger = require("../helpers/logger");
const { z, date } = require("zod");

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
        mealType,
      } = req.body;

      // find or create food
      const whereClause = externalId 
        ? { externalId, source } 
        : { name: name.toLowerCase() };

      const [food] = await Food.findOrCreate({
        where: whereClause,
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
        quantity: z.coerce
          .number()
          .min(1)
          .parse(quantity || 1),
        consumedAt: consumedAt ? z.coerce.date().parse(consumedAt) : new Date(),
        mealType: mealType || "snack",
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      await AIInsight.destroy({
        where: {
          userId,
          date: {
            [Op.gte]: today,
          },
        },
      });

      res.status(201).json({
        status: "success",
        data: log,
        meta: null,
      });
    } catch (err) {
      next(err);
      logger.error("Create Log Error", err.message);
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

      res.json({
        status: "success",
        data: logs,
        meta: {
          total: logs.length,
        },
      });
    } catch (err) {
      next(err);
      logger.error("Get Logs Error", err.message);
    }
  }

  // GET TODAY
  static async getLogsToday(req, res, next) {
    try {
      const userId = req.user.id;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const logs = await FoodLog.findAll({
        where: {
          userId,
          consumedAt: {
            [Op.gte]: today,
          },
        },
        include: [{ model: Food }],
        order: [["consumedAt", "DESC"]],
      });

      const totalCalories = logs.reduce((sum, log) => {
        return sum + (log.Food?.calories || 0) * (log.quantity || 1);
      }, 0);

      res.json({
        status: "success",
        data: {
          logs,
          totalCalories,
        },
        meta: {
          total: logs.length,
          date: today.toISOString().split("T")[0],
        },
      });
    } catch (err) {
      next(err);
      logger.error("Get Logs Today Error", err.message);
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

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      await AIInsight.destroy({
        where: {
          userId,
          date: {
            [Op.gte]: today,
          },
        },
      });

      res.json({
        status: "success",
        message: "Deleted",
        meta: null,
      });
    } catch (err) {
      next(err);
      logger.error("Delete Log Error", err.message);
    }
  }
}

module.exports = LogController;
