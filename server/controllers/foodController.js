const { searchFood, detectFoodService } = require("../services/food.service");
const { Food } = require("../models");
const logger = require("../helpers/logger");

class FoodController {
  static async detectFood(req, res, next) {
    try {
      if (!req.file) {
        throw { name: "BadRequest", message: "Image is required" };
      }
      const { aiSource, ...data } = await detectFoodService(req.file);
      res.json({
        status: "success",
        data,
        meta: {
          ai: aiSource,
          cached: false,
        },
      });
    } catch (err) {
      next(err);
      logger.error("AI Error", err.message);
    }
  }
  static async searchFood(req, res, next) {
    try {
      const { q } = req.query;

      if (!q || !q.trim()) {
        throw { name: "BadRequest", message: "Query is required" };
      }

      const data = await searchFood(q.trim());

      res.json({
        status: "success",
        data: {
          total: data.length,
          options: data,
        },
        meta: null,
      });
    } catch (err) {
      next(err);
      logger.error("Search Error", err.message);
    }
  }
  static async getFoodDetail(req, res, next) {
    try {
      const { id } = req.params;

      const food = await Food.findByPk(id);

      if (!food) {
        throw { name: "NotFound", message: "Food not found" };
      }

      res.json({
        status: "success",
        data: food,
        meta: null,
      });
    } catch (err) {
      next(err);
      logger.error("FoodDetail Error", err.message);
    }
  }
}

module.exports = FoodController;
