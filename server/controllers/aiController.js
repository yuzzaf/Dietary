const logger = require("../helpers/logger");
const { User, FoodLog, Food } = require("../models");
const { generateInsight } = require("../services/ai.service");
const {
  calculateTDEE,
  calculateTotalCalories,
} = require("../services/nutrition.service");

class AIController {
  static async generateInsight(req, res, next) {
    try {
      const userId = req.user.id;

      const user = await User.findByPk(userId);

      const logs = await FoodLog.findAll({
        where: { userId },
        include: [{ model: Food }],
      });

      const foods = logs.map((l) => l.Food);

      const targetCalories = calculateTDEE(user);
      const consumedCalories = calculateTotalCalories(logs);
      const remaining = targetCalories - consumedCalories;

      let status = "balanced";
      if (remaining > 200) status = "deficit";
      else if (remaining < -200) status = "excess";

      // CALL GEMINI
      const insight = await generateInsight({
        foods,
        targetCalories,
        consumedCalories,
        remaining,
        status,
      });

      res.json({
        targetCalories,
        consumedCalories,
        remaining,
        status,
        insight,
      });
    } catch (err) {
      next(err);
      logger.error(err);
    }
  }
}

module.exports = AIController;
