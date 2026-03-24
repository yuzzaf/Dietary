const request = require("supertest");
const app = require("../app");
const { sequelize } = require("../models");
const { AIInsight } = require("../models");

jest.mock("../services/ai/gemini.service", () => ({
  generateInsight: jest.fn().mockResolvedValue(
    "Mocked AI Insight about your balanced diet.",
  ),
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
});
