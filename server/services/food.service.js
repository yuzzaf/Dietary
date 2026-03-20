const { searchEdamam } = require("./edamam.service.js");
const { searchFatSecret } = require("./fatsecret.service.js");
const logger = require("../helpers/logger.js");
const { detectFoodHF } = require("./ai/detect.service.js");
const { detectWithGemini } = require("./ai/gemini.service.js");

const searchFood = async (query) => {
  try {
    const edamamResult = await searchEdamam(query);

    if (edamamResult && edamamResult.length > 0) {
      return edamamResult;
    }

    const fatsecretResult = await searchFatSecret(query);

    if (fatsecretResult && fatsecretResult.length > 0) {
      return fatsecretResult;
    }

    return [];
  } catch (err) {
    logger.error({
      message: "Food Service Error",
      error: err.message,
    });

    try {
      const fallback = await searchFatSecret(query);
      return fallback || [];
    } catch (fallbackErr) {
      logger.error({
        message: "Fallback FatSecret Error",
        error: fallbackErr.message,
      });

      return [];
    }
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

  try {
    geminiResult = await detectWithGemini(file);
  } catch {
    geminiResult = null;
  }

  const hfLabel = hfResult?.label ? normalizeLabel(hfResult.label) : null;

  const geminiLabel = geminiResult ? normalizeLabel(geminiResult) : null;

  let detected;

  if (hfResult && hfResult.score >= 0.7) {
    detected = hfLabel;
  } else if (geminiLabel) {
    detected = geminiLabel;
  } else if (hfLabel) {
    detected = hfLabel;
  } else {
    throw { name: "BadRequest", message: "Detection failed" };
  }

  if (
    hfLabel &&
    geminiLabel &&
    geminiLabel.includes(hfLabel) &&
    geminiLabel.length > hfLabel.length
  ) {
    detected = geminiLabel;
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
