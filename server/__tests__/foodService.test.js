const { searchFood, detectFoodService } = require("../services/food.service");
const edamam = require("../services/edamam.service");
const fatsecret = require("../services/fatsecret.service");
const gemini = require("../services/ai/gemini.service");

jest.mock("../services/edamam.service");
jest.mock("../services/fatsecret.service");
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
    it("should return combined results if available from both source", async () => {
      edamam.searchEdamam.mockResolvedValueOnce([{ name: "Apple", source: "edamam" }]);
      fatsecret.searchFatSecret.mockResolvedValueOnce([{ name: "Apple FS", source: "fatsecret" }]);
      
      const result = await searchFood("apple");
      expect(result).toHaveLength(2);
      expect(edamam.searchEdamam).toHaveBeenCalledWith("apple");
      expect(fatsecret.searchFatSecret).toHaveBeenCalledWith("apple");
    });

    it("should still return edamam result even if fatsecret returns empty", async () => {
      edamam.searchEdamam.mockResolvedValueOnce([{ name: "Banana", source: "edamam" }]);
      fatsecret.searchFatSecret.mockResolvedValueOnce([]);
      
      const result = await searchFood("banana");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Banana");
      expect(fatsecret.searchFatSecret).toHaveBeenCalled();
    });

    it("should return empty array if both return empty", async () => {
      edamam.searchEdamam.mockResolvedValueOnce([]);
      fatsecret.searchFatSecret.mockResolvedValueOnce([]);
      
      const result = await searchFood("unknown");
      expect(result).toEqual([]);
    });

    it("should return data from one service even if the other throws an error", async () => {
      edamam.searchEdamam.mockRejectedValueOnce(new Error("API Error"));
      fatsecret.searchFatSecret.mockResolvedValueOnce([{ name: "Orange", source: "fatsecret" }]);
      
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

    it("should return search options when Gemini detects successfully", async () => {
      gemini.detectWithGemini.mockResolvedValueOnce("burger");
      edamam.searchEdamam.mockResolvedValueOnce([{ name: "Burger", calories: 500 }]);

      const result = await detectFoodService(fakeFile);
      expect(result.detected).toBe("burger");
      expect(result.options).toHaveLength(1);
      expect(result.aiSource).toBe("gemini");
      expect(gemini.detectWithGemini).toHaveBeenCalledWith(fakeFile);
    });

    it("should normalize labels like 'dish' to 'food'", async () => {
      gemini.detectWithGemini.mockResolvedValueOnce("dish");
      edamam.searchEdamam.mockResolvedValueOnce([]);
      fatsecret.searchFatSecret.mockResolvedValueOnce([]);

      const result = await detectFoodService(fakeFile);
      expect(result.detected).toBe("food");
      expect(result.options).toEqual([]);
      expect(result.aiSource).toBe("gemini");
      expect(result.message).toBe("Food not found, try manual input");
    });

    it("should throw error if Gemini detection fails or returns null", async () => {
      gemini.detectWithGemini.mockRejectedValueOnce(new Error("Gemini limit"));

      await expect(detectFoodService(fakeFile)).rejects.toHaveProperty("name", "BadRequest");
    });
  });
});
