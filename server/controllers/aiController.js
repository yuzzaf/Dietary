const logger = require("../helpers/logger");
const { User, FoodLog, Food, UserGoal, AIInsight } = require("../models");
const { generateInsight } = require("../services/ai/gemini.service.js");
const {
  calculateTotalCalories,
  calculateUserTarget,
} = require("../services/nutrition.service");

const { Op } = require("sequelize");

class AIController {
  static async generateInsight(req, res, next) {
    try {
      const userId = req.user.id;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existing = await AIInsight.findOne({
        where: {
          userId,
          date: {
            [Op.gte]: today,
          },
        },
      });

      if (existing) {
        return res.json({
          status: "success",
          data: {
            targetCalories: existing.caloriesTarget,
            consumedCalories: existing.caloriesConsumed,
            remaining: existing.caloriesTarget - existing.caloriesConsumed,
            status: existing.status,
            insight: existing.content,
          },
          meta: {
            ai: "gemini",
            cached: true,
          },
        });
      }

      const user = await User.findByPk(userId);
      if (!user.weight || !user.height) {
        throw { name: "BadRequest", message: "Complete your profile first" };
      }

      const goal = await UserGoal.findOne({ where: { userId } });

      const logs = await FoodLog.findAll({
        where: {
          userId,
          consumedAt: {
            [Op.gte]: today,
          },
        },
        include: [{ model: Food }],
      });

      const foods = logs.map((l) => l.Food);

      const targetCalories = calculateUserTarget(user, goal);
      const consumedCalories = calculateTotalCalories(logs);
      const remaining = targetCalories - consumedCalories;

      let status = "balanced";
      if (remaining > 200) status = "deficit";
      else if (remaining < -200) status = "excess";

      let insight;
      try {
        insight = await generateInsight({
          foods,
          targetCalories,
          consumedCalories,
          remaining,
          status,
        });
      } catch (geminiError) {
        logger.error("AI Error", geminiError.message);
        insight = "Keep maintaining a balanced diet.";
      }

      await AIInsight.create({
        userId,
        date: new Date(),
        content: insight,
        caloriesConsumed: consumedCalories,
        caloriesTarget: targetCalories,
        status,
      });

      res.json({
        status: "success",
        data: {
          targetCalories,
          consumedCalories,
          remaining,
          status,
          insight,
          goalType: goal ? goal.goalType : null,
        },
        meta: {
          ai: "gemini",
          cached: false,
        },
      });
    } catch (err) {
      next(err);
      logger.error("AI Insight Error", err.message);
    }
  }

  static async getInsightsWeekly(req, res, next) {
    try {
      const userId = req.user.id;
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const insights = await AIInsight.findAll({
        where: {
          userId,
          date: {
            [Op.gte]: oneWeekAgo,
          },
        },
        order: [["date", "DESC"]],
      });

      res.json({
        status: "success",
        data: insights,
        meta: {
          total: insights.length,
          timeframe: "7 days",
        },
      });
    } catch (err) {
      next(err);
      logger.error("Weekly Insights Error", err.message);
    }
  }
}

module.exports = AIController;
