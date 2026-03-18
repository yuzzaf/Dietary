const { searchFood } = require("../services/food.service");
const { Food } = require("../models");
const logger = require("../helpers/logger");

class FoodController {
  static async searchFood(req, res, next) {
    try {
      const { q } = req.query;

      if (!q || !q.trim()) {
        throw { name: "BadRequest", message: "Query is required" };
      }

      const data = await searchFood(q.trim());

      res.json({
        total: data.length,
        data,
      });
    } catch (err) {
      next(err);
      logger.error(err);
    }
  }
  static async getFoodDetail(req, res, next) {
    try {
      const { id } = req.params;

      const food = await Food.findByPk(id);

      if (!food) {
        throw { name: "NotFound", message: "Food not found" };
      }

      res.json(food);
    } catch (err) {
      next(err);
      logger.error(err);
    }
  }
}

module.exports = FoodController;
