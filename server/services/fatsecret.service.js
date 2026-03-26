const axios = require("axios");
const logger = require("../helpers/logger.js");

const getAccessToken = async () => {
  try {
    const response = await axios.post(
      "https://oauth.fatsecret.com/connect/token",
      new URLSearchParams({
        grant_type: "client_credentials",
        scope: "premier",
        client_id: process.env.FATSECRET_CLIENT_ID,
        client_secret: process.env.FATSECRET_CLIENT_SECRET,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      },
    );

    return response.data.access_token;
  } catch (err) {
    logger.error("FatSecret Token Error:", err.message);
    throw err;
  }
};

const searchFatSecret = async (query) => {
  try {
    const token = await getAccessToken();

    const response = await axios.get(
      "https://platform.fatsecret.com/rest/foods/search/v5",
      {
        params: {
          search_expression: query,
          format: "json",
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      },
    );

    const foodsResponse = response.data.foods_search?.results?.food || response.data.foods?.food;

    if (!foodsResponse) return [];

    const list = Array.isArray(foodsResponse) ? foodsResponse : [foodsResponse];

    //  NORMALISASI
    return list.map((item) => {
      let calories = 0, protein = 0, fat = 0, carbs = 0;

      if (item.food_description) {
        calories = extractNutrient(item.food_description, "Calories");
        protein = extractNutrient(item.food_description, "Protein");
        fat = extractNutrient(item.food_description, "Fat");
        carbs = extractNutrient(item.food_description, "Carbs");
      } else if (item.servings?.serving) {
        const serving = Array.isArray(item.servings.serving) ? item.servings.serving[0] : item.servings.serving;
        calories = parseFloat(serving.calories || 0);
        protein = parseFloat(serving.protein || 0);
        fat = parseFloat(serving.fat || 0);
        carbs = parseFloat(serving.carbohydrate || 0);
      }

      return {
        name: item.food_name,
        calories,
        protein,
        fat,
        carbs,
        source: "fatsecret",
        externalId: item.food_id,
      };
    });
  } catch (err) {
    logger.error("FatSecret Search Error:", err.message);
    throw err;
  }
};

const extractNutrient = (description, nutrientName) => {
  const regex = new RegExp(`${nutrientName}:\\s*([\\d.]+)\\s*(?:kcal|g)?`, "i");
  const match = description.match(regex);
  return match ? parseFloat(match[1]) : 0;
};

module.exports = { searchFatSecret };
