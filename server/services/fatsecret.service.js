const axios = require("axios");
const logger = require("../helpers/logger.js");

const getAccessToken = async () => {
  try {
    const response = await axios.post(
      "https://oauth.fatsecret.com/connect/token",
      new URLSearchParams({
        grant_type: "client_credentials",
        scope: "premier",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        auth: {
          username: process.env.FATSECRET_CLIENT_ID,
          password: process.env.FATSECRET_CLIENT_SECRET,
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
        },
      },
    );

    const foods = response.data.foods?.food;

    if (!foods) return [];

    const list = Array.isArray(foods) ? foods : [foods];

    //  NORMALISASI
    return list.map((item) => ({
      name: item.food_name,
      calories: extractNutrient(item.food_description, "Calories"),
      protein: extractNutrient(item.food_description, "Protein"),
      fat: extractNutrient(item.food_description, "Fat"),
      carbs: extractNutrient(item.food_description, "Carbs"),
      source: "fatsecret",
      external_id: item.food_id,
    }));
  } catch (err) {
    logger.error("FatSecret Search Error:", err.message);
    throw err;
  }
};

const extractNutrient = (description, nutrientName) => {
  const regex = new RegExp(`${nutrientName}:\\s*([\\d.]+)\\s*g`);
  const match = description.match(regex);
  return match ? parseFloat(match[1]) : 0;
};

module.exports = { searchFatSecret };
