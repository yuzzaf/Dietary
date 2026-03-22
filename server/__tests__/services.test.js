const axios = require("axios");
const { searchFatSecret } = require("../services/fatsecret.service");
const { generateInsight, detectWithGemini } = require("../services/ai/gemini.service");
const { GoogleGenerativeAI } = require("@google/generative-ai");

jest.mock("axios");

// Membuat Mocking untuk Google Generative AI (Gemini API)
jest.mock("@google/generative-ai", () => {
  const mGenerateContent = jest.fn();
  const mGetGenerativeModel = jest.fn(() => ({
    generateContent: mGenerateContent,
  }));
  return {
    GoogleGenerativeAI: jest.fn(() => ({
      getGenerativeModel: mGetGenerativeModel,
    })),
  };
});

describe("External API Services Mock Testing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("FatSecret Service", () => {
    it("should retrieve access token and output formatted food search", async () => {
      // 1. Memalsukan respons axios.post() untuk mendapatkan Access Token
      axios.post.mockResolvedValueOnce({
        data: { access_token: "mocked-fatsecret-token-123" },
      });

      // 2. Memalsukan respons axios.get() untuk FatSecret Search API
      axios.get.mockResolvedValueOnce({
        data: {
          foods: {
            food: [
              {
                food_name: "Apple",
                food_description:
                  "Per 100g - Calories: 52kcal | Fat: 0.17g | Carbs: 13.81g | Protein: 0.26g",
                food_id: "12345",
              },
            ],
          },
        },
      });

      const results = await searchFatSecret("apple");

      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.get).toHaveBeenCalledTimes(1);

      // Verifikasi regex untuk ektrak kalori berjalan sempurna
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("Apple");
      expect(results[0].calories).toBe(52);
      expect(results[0].fat).toBe(0.17);
      expect(results[0].carbs).toBe(13.81);
      expect(results[0].protein).toBe(0.26);
    });

    it("should return empty array if no foods found", async () => {
      axios.post.mockResolvedValueOnce({ data: { access_token: "mock-token" } });
      axios.get.mockResolvedValueOnce({ data: { foods: null } });

      const results = await searchFatSecret("unknownfood");
      expect(results).toEqual([]);
    });

    it("should handle a single food object returned (API terkadang return obj, bukan array)", async () => {
      axios.post.mockResolvedValueOnce({ data: { access_token: "mock-token" } });
      axios.get.mockResolvedValueOnce({
        data: {
          foods: {
            food: {
              food_name: "Banana",
              food_description:
                "Per 100g - Calories: 89kcal | Fat: 0.3g | Carbs: 22.8g | Protein: 1.1g",
              food_id: "54321",
            },
          },
        },
      });

      const results = await searchFatSecret("banana");
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("Banana");
    });
  });

  describe("Gemini AI Service", () => {
    let mockGenerateContent;

    beforeEach(() => {
      const genAIInstance = new GoogleGenerativeAI();
      const model = genAIInstance.getGenerativeModel();
      mockGenerateContent = model.generateContent;
    });

    it("should successfully generate diet insight", async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => "You are doing great! Keep it up.",
        },
      });

      const insight = await generateInsight({
        foods: [{ name: "Apple", calories: 52 }],
        targetCalories: 2000,
        consumedCalories: 500,
        remaining: 1500,
        status: "deficit",
      });

      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
      expect(insight).toBe("You are doing great! Keep it up.");
    });

    it("should throw error if Gemini API request fails", async () => {
      mockGenerateContent.mockRejectedValueOnce(new Error("Gemini Server Down"));

      await expect(
        generateInsight({
          foods: [],
          targetCalories: 2000,
          consumedCalories: 0,
          remaining: 2000,
          status: "deficit",
        })
      ).rejects.toThrow("Gemini Server Down");
    });

    it("should parse detected food from image buffer correctly", async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => "Burger.\nIgnore this",
        },
      });

      const fakeFile = {
        buffer: Buffer.from("fake-image-encoded-data"),
        mimetype: "image/jpeg",
      };

      const result = await detectWithGemini(fakeFile);
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
      
      // Karena methodnya membersihkan titik dan mengambil line 1: text.toLowerCase().replace(".", "").split("\n")[0].trim()
      expect(result).toBe("burger");
    });
  });
});
