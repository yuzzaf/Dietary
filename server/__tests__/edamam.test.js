const axios = require("axios");
const { searchEdamam } = require("../services/edamam.service");
const logger = require("../helpers/logger.js");

jest.mock("axios");
jest.mock("../helpers/logger.js", () => ({ error: jest.fn() }));

describe("Edamam Service", () => {
  it("should return parsed food array", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        hints: [
          {
            food: {
              label: "Apple",
              nutrients: { ENERC_KCAL: 52, PROCNT: 0.3, FAT: 0.2, CHOCDF: 14 },
              foodId: "food_123"
            }
          }
        ]
      }
    });

    const result = await searchEdamam("apple");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Apple");
    expect(result[0].calories).toBe(52);
    expect(result[0].externalId).toBe("food_123");
  });

  it("should handle missing nutrients gracefully", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        hints: [
          {
            food: {
              label: "Unknown",
              nutrients: {}, // Missing nutrients to trigger "|| 0"
              foodId: "food_unk"
            }
          }
        ]
      }
    });

    const result = await searchEdamam("unknown");
    expect(result).toHaveLength(1);
    expect(result[0].calories).toBe(0);
    expect(result[0].protein).toBe(0);
    expect(result[0].fat).toBe(0);
    expect(result[0].carbs).toBe(0);
  });

  it("should return empty array if no hints", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        hints: []
      }
    });

    const result = await searchEdamam("notfood");
    expect(result).toEqual([]);
  });

  it("should throw error and log it when axios fails", async () => {
    const error = new Error("Network Error");
    axios.get.mockRejectedValueOnce(error);

    await expect(searchEdamam("apple")).rejects.toThrow("Network Error");
    expect(logger.error).toHaveBeenCalled();
  });
});
