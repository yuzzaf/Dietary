const axios = require("axios");
const logger = require("../helpers/logger.js");

const searchEdamam = async (query) => {
  try {
    const response = await axios.get(
      "https://api.edamam.com/api/food-database/v2/parser",
      {
        params: {
          ingr: query,
          app_id: process.env.EDAMAM_APP_ID,
          app_key: process.env.EDAMAM_APP_KEY,
        },
      },
    );

    const hints = response.data.hints;

    if (!hints || hints.length === 0) return [];

    // normalize data
    return hints.map((item) => {
      const food = item.food;

      return {
        name: food.label,
        calories: food.nutrients.ENERC_KCAL || 0,
        protein: food.nutrients.PROCNT || 0,
        fat: food.nutrients.FAT || 0,
        carbs: food.nutrients.CHOCDF || 0,
        source: "edamam",
        externalId: food.foodId,
      };
    });
  } catch (err) {
    logger.error("Edamam error:", err.message);
    throw err;
  }
};

module.exports = { searchEdamam };
