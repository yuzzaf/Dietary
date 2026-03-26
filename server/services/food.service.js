const { searchEdamam } = require("./edamam.service.js");
const { searchFatSecret } = require("./fatsecret.service.js");
const logger = require("../helpers/logger.js");
const { detectFoodHF } = require("./ai/detect.service.js");
const { detectWithGemini } = require("./ai/gemini.service.js");

const searchFood = async (query) => {
  try {
    const [edamamResponse, fatsecretResponse] = await Promise.allSettled([
      searchEdamam(query),
      searchFatSecret(query),
    ]);

    let combinedResults = [];

    if (fatsecretResponse.status === "fulfilled" && Array.isArray(fatsecretResponse.value)) {
      combinedResults = [...combinedResults, ...fatsecretResponse.value];
    } else if (fatsecretResponse.status === "rejected") {
      const fsErr = fatsecretResponse.reason?.response?.data || fatsecretResponse.reason?.message;
      logger.error({ message: "FatSecret Service Error", error: fsErr });
    }

    if (edamamResponse.status === "fulfilled" && Array.isArray(edamamResponse.value)) {
      combinedResults = [...combinedResults, ...edamamResponse.value];
    } else if (edamamResponse.status === "rejected") {
      const edaErr = edamamResponse.reason?.response?.data || edamamResponse.reason?.message;
      logger.error({ message: "Edamam Service Error", error: edaErr });
    }

    return combinedResults;
  } catch (err) {
    logger.error({
      message: "Food Service Combined Error",
      error: err.message,
    });
    return [];
  }
};

const normalizeLabel = (label) => {
  if (!label) return "food";

  let clean = label.toLowerCase();

  clean = clean.split(",")[0];

  const map = {
    dish: "food",
    plate: "food",
    meal: "food",
  };

  return map[clean] || clean;
};

const detectFoodService = async (file) => {
  let hfResult;
  let geminiResult;

  try {
    hfResult = await detectFoodHF(file);
  } catch {
    hfResult = null;
  }
  
  let detected = hfResult?.label ? normalizeLabel(hfResult.label) : null;

  if (!detected) {
    try {
      geminiResult = await detectWithGemini(file);
      detected = geminiResult ? normalizeLabel(geminiResult) : null;
    } catch {
      geminiResult = null;
    }
  }

  if (!detected) {
    throw { name: "BadRequest", message: "Detection failed. The AI model is currently loading or your API limit is reached. Please try again in a few minutes." };
  }

  const results = await searchFood(detected);

  if (!results.length) {
    return {
      detected,
      options: [],
      message: "Food not found, try manual input",
    };
  }

  return {
    detected,
    options: results,
  };
};

module.exports = { searchFood, detectFoodService };
