const { searchFood, detectFoodService } = require("../services/food.service");
const edamam = require("../services/edamam.service");
const fatsecret = require("../services/fatsecret.service");
const hf = require("../services/ai/detect.service");
const gemini = require("../services/ai/gemini.service");

jest.mock("../services/edamam.service");
jest.mock("../services/fatsecret.service");
jest.mock("../services/ai/detect.service");
jest.mock("../services/ai/gemini.service");
jest.mock("../helpers/logger", () => ({
  error: jest.fn(),
  info: jest.fn()
}));

describe("Food Service Validation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("searchFood", () => {
    it("should return edamam result if available", async () => {
      edamam.searchEdamam.mockResolvedValueOnce([{ name: "Apple", calories: 50 }]);
      const result = await searchFood("apple");
      expect(result).toHaveLength(1);
      expect(edamam.searchEdamam).toHaveBeenCalledWith("apple");
      expect(fatsecret.searchFatSecret).not.toHaveBeenCalled();
    });

    it("should fallback to fatsecret if edamam returns empty", async () => {
      edamam.searchEdamam.mockResolvedValueOnce([]);
      fatsecret.searchFatSecret.mockResolvedValueOnce([{ name: "Banana", calories: 90 }]);
      
      const result = await searchFood("banana");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Banana");
      expect(fatsecret.searchFatSecret).toHaveBeenCalledWith("banana");
    });

    it("should return empty array if both return empty", async () => {
      edamam.searchEdamam.mockResolvedValueOnce([]);
      fatsecret.searchFatSecret.mockResolvedValueOnce([]);
      
      const result = await searchFood("unknown");
      expect(result).toEqual([]);
    });

    it("should fallback to fatsecret if edamam throws an error", async () => {
      edamam.searchEdamam.mockRejectedValueOnce(new Error("API Error"));
      fatsecret.searchFatSecret.mockResolvedValueOnce([{ name: "Orange", calories: 40 }]);
      
      const result = await searchFood("orange");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Orange");
    });

    it("should return empty array if both throw errors", async () => {
      edamam.searchEdamam.mockRejectedValueOnce(new Error("API Error"));
      fatsecret.searchFatSecret.mockRejectedValueOnce(new Error("API Error 2"));
      
      const result = await searchFood("mango");
      expect(result).toEqual([]);
    });
  });

  describe("detectFoodService", () => {
    const fakeFile = { buffer: Buffer.from("test"), mimetype: "image/jpeg" };

    it("should return search options when HF detects successfully", async () => {
      // HF successfully detects "burger"
      hf.detectFoodHF.mockResolvedValueOnce({ label: "burger" });
      edamam.searchEdamam.mockResolvedValueOnce([{ name: "Burger", calories: 500 }]);

      const result = await detectFoodService(fakeFile);
      expect(result.detected).toBe("burger");
      expect(result.options).toHaveLength(1);
      expect(hf.detectFoodHF).toHaveBeenCalled();
      expect(gemini.detectWithGemini).not.toHaveBeenCalled();
    });

    it("should fallback to gemini if HF fails to detect", async () => {
      hf.detectFoodHF.mockRejectedValueOnce(new Error("HF Error"));
      gemini.detectWithGemini.mockResolvedValueOnce("pizza");
      edamam.searchEdamam.mockResolvedValueOnce([{ name: "Pizza", calories: 800 }]);

      const result = await detectFoodService(fakeFile);
      expect(result.detected).toBe("pizza");
      expect(result.options).toHaveLength(1);
      expect(gemini.detectWithGemini).toHaveBeenCalled();
    });

    it("should normalize labels like 'dish' to 'food'", async () => {
      hf.detectFoodHF.mockResolvedValueOnce({ label: "dish" });
      edamam.searchEdamam.mockResolvedValueOnce([]);
      fatsecret.searchFatSecret.mockResolvedValueOnce([]);

      const result = await detectFoodService(fakeFile);
      expect(result.detected).toBe("food");
      expect(result.options).toEqual([]);
      expect(result.message).toBe("Food not found, try manual input");
    });

    it("should throw error if both AI detections fail", async () => {
      hf.detectFoodHF.mockRejectedValueOnce(new Error("HF limit"));
      gemini.detectWithGemini.mockRejectedValueOnce(new Error("Gemini limit"));

      await expect(detectFoodService(fakeFile)).rejects.toHaveProperty("name", "BadRequest");
    });
  });
});
