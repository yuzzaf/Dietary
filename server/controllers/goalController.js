const { UserGoal, AIInsight } = require("../models");
const { Op } = require("sequelize");
const logger = require("../helpers/logger");

class GoalController {
  static async upsertGoal(req, res, next) {
    try {
      const { goalType, targetCalories } = req.body;
      const userId = req.user.id;

      // Find if goal already exists
      let goal = await UserGoal.findOne({ where: { userId } });

      if (goal) {
        goal = await goal.update({ goalType, targetCalories });
      } else {
        goal = await UserGoal.create({ userId, goalType, targetCalories });
      }

      // Invalidate the AI Insights cache for today so the new goal applies immediately
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

      res.status(200).json({
        status: "success",
        data: goal,
        meta: null,
      });
    } catch (err) {
      logger.error("Upsert Goal Error", err.message);
      next(err);
    }
  }

  static async getGoal(req, res, next) {
    try {
        const userId = req.user.id;
        const goal = await UserGoal.findOne({ where: { userId } });
        res.status(200).json({
          status: "success",
          data: goal || null,
          meta: null,
        });
    } catch (err) {
        logger.error("Get Goal Error", err.message);
        next(err);
    }
  }
}

module.exports = GoalController;
