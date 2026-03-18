const { searchEdamam } = require("./edamam.service.js");
const { searchFatSecret } = require("./fatsecret.service.js");
const logger = require("../helpers/logger.js");

export const searchFood = async (query) => {
  try {
    // STEP 1: coba Edamam dulu
    const edamamResult = await searchEdamam(query);

    if (edamamResult && edamamResult.length > 0) {
      return edamamResult;
    }

    // STEP 2: fallback ke FatSecret
    const fatsecretResult = await searchFatSecret(query);

    if (fatsecretResult && fatsecretResult.length > 0) {
      return fatsecretResult;
    }

    // STEP 3: kalau dua-duanya kosong
    return [];
  } catch (err) {
    logger.error({
      message: "Food Service Error",
      error: err.message,
    });

    try {
      // fallback terakhir
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
