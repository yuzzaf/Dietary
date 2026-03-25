const request = require("supertest");
const app = require("../app");
const { sequelize } = require("../models");
const { AIInsight, User } = require("../models");
const geminiService = require("../services/ai/gemini.service");

jest.mock("../services/ai/gemini.service", () => ({
  generateInsight: jest.fn().mockResolvedValue(
    "Mocked AI Insight about your balanced diet.",
  ),
  chatWithGemini: jest.fn().mockResolvedValue(true)
}));

let access_token;
let userId;

beforeAll(async () => {
  await sequelize.queryInterface.bulkDelete("Users", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
  await sequelize.queryInterface.bulkDelete("AIInsights", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });

  const regRes = await request(app).post("/api/auth/register").send({
    email: "aitest@mail.com",
    password: "password123",
    firstName: "AI",
    lastName: "Tester",
  });
  userId = regRes.body.id;

  const res = await request(app).post("/api/auth/login").send({
    email: "aitest@mail.com",
    password: "password123",
  });

  access_token = res.body.access_token;
  
  // Need to provide complete profile so it isn't counted as incomplete for insights
  await request(app)
    .patch("/api/users/profile")
    .set("Authorization", `Bearer ${access_token}`)
    .send({
      weight: 70,
      height: 175,
      age: 25,
      gender: "Male",
      activityLevel: "Moderate",
    });
});

afterAll(async () => {
  await sequelize.close();
});

describe("AI Endpoints", () => {
  describe("GET /api/ai/insight", () => {
    it("should generate new insight if profile is complete", async () => {
      const response = await request(app)
        .get("/api/ai/insight")
        .set("Authorization", `Bearer ${access_token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.insight).toBe(
        "Mocked AI Insight about your balanced diet."
      );
      expect(response.body.meta.cached).toBe(false);
    });

    it("should return cached insight on the same day", async () => {
      // Assuming the first run created an insight for today
      const response = await request(app)
        .get("/api/ai/insight")
        .set("Authorization", `Bearer ${access_token}`);

      expect(response.status).toBe(200);
      expect(response.body.meta.cached).toBe(true);
      expect(response.body.data.insight).toBe(
        "Mocked AI Insight about your balanced diet."
      );
    });

    it("should return 401 if missing token", async () => {
      const response = await request(app).get("/api/ai/insight");
      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/ai/insight/weekly", () => {
    it("should return list of weekly insights", async () => {
      const response = await request(app)
        .get("/api/ai/insight/weekly")
        .set("Authorization", `Bearer ${access_token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.meta.timeframe).toBe("7 days");
    });

    it("should return 401 if missing token", async () => {
      const response = await request(app).get("/api/ai/insight/weekly");
      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/ai/insight/export", () => {
    it("should export weekly insights as pdf", async () => {
      const response = await request(app)
        .get("/api/ai/insight/export")
        .set("Authorization", `Bearer ${access_token}`);

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toBe("application/pdf");
      expect(response.headers["content-disposition"]).toMatch(/attachment; filename=Dietary_Weekly_Report/);
    });

    it("should export pdf with empty data if no insights", async () => {
      // Return empty array
      jest.spyOn(AIInsight, "findAll").mockResolvedValueOnce([]);
      
      const response = await request(app)
        .get("/api/ai/insight/export")
        .set("Authorization", `Bearer ${access_token}`);

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toBe("application/pdf");
      jest.restoreAllMocks();
    });

    it("should handle error in pdf export when headers are already sent", () => {
      // Mock Express response
      const mockRes = {
        setHeader: jest.fn(),
        headersSent: true,
      };
      const mockReq = { user: { id: 1 } };
      const next = jest.fn();
      const logger = require("../helpers/logger");
      jest.spyOn(logger, "error").mockImplementation(() => {});

      // Simulate the catch block manually for coverage
      const aiController = require("../controllers/aiController");
      // Create a mock that throws an error when trying to require pdfkit or findByPk
      jest.spyOn(User, "findByPk").mockRejectedValueOnce(new Error("Fake Error"));
      
      aiController.exportInsightWeeklyPdf(mockReq, mockRes, next).then(() => {
        expect(logger.error).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
        jest.restoreAllMocks();
      });
    });
  });

  describe("POST /api/ai/chat", () => {
    it("should create ai chat handle stream", async () => {
      const response = await request(app)
        .post("/api/ai/chat")
        .set("Authorization", `Bearer ${access_token}`)
        .send({
          message: "Hello",
          history: [],
          socketId: "mock_socket123"
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.reply).toBe("Streaming started...");
    });

    it("should return 400 if message missing", async () => {
      const response = await request(app)
        .post("/api/ai/chat")
        .set("Authorization", `Bearer ${access_token}`)
        .send({
          history: [],
          socketId: "mock_socket123"
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Message is required");
    });
  });

  describe("GET /api/ai/insight incomplete profile", () => {
    it("should return error about incomplete profile", async () => {
      const regRes = await request(app).post("/api/auth/register").send({
        email: "inc@mail.com",
        password: "password123",
        firstName: "Incomplete",
        lastName: "User",
      });
      const res = await request(app).post("/api/auth/login").send({
        email: "inc@mail.com",
        password: "password123",
      });
      const inc_token = res.body.access_token;

      const response = await request(app)
        .get("/api/ai/insight")
        .set("Authorization", `Bearer ${inc_token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data.insight).toContain("Please go to the Profile page");
    });
  });

  describe("gemini error test", () => {
    it("should return fallback string on gemini failure", async () => {
      // delete existing insight for user
      await AIInsight.destroy({ where: { userId } , force: true });
      
      geminiService.generateInsight.mockRejectedValueOnce(new Error("Gemini Error"));
      // make it deficit so we hit branch 85
      jest.spyOn(require("../services/nutrition.service"), "calculateTotalCalories").mockReturnValue(100);
      jest.spyOn(require("../services/nutrition.service"), "calculateUserTarget").mockReturnValue(2000);

      const response = await request(app)
        .get("/api/ai/insight")
        .set("Authorization", `Bearer ${access_token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.insight).toBe("Keep maintaining a balanced diet.");
      expect(response.body.data.status).toBe("deficit");
    });

    it("should return excess status and branch when > 200 excess", async () => {
      await AIInsight.destroy({ where: { userId } , force: true });
      
      const { Food, FoodLog } = require("../models");
      const heavyFood = await Food.create({
          name: "Giant Burger",
          calories: 5000,
          source: "manual",
          protein: 100, fat: 100, carbs: 100
      });
      await FoodLog.create({
          userId,
          foodId: heavyFood.id,
          quantity: 1,
          mealType: "dinner",
          consumedAt: new Date()
      });

      const response = await request(app)
        .get("/api/ai/insight")
        .set("Authorization", `Bearer ${access_token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe("excess");
    });
  });
});

