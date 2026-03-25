const request = require("supertest");
const app = require("../app");
const { sequelize } = require("../models");

let access_token;
let createdLogId;

beforeAll(async () => {
  await sequelize.queryInterface.bulkDelete("Users", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });

  await request(app).post("/api/auth/register").send({
    email: "logtest@mail.com",
    password: "password123",
    firstName: "Log",
    lastName: "Tester",
  });

  const res = await request(app).post("/api/auth/login").send({
    email: "logtest@mail.com",
    password: "password123",
  });

  access_token = res.body.access_token;
});

afterAll(async () => {
  await sequelize.close();
});

describe("Log Endpoints", () => {
  describe("POST /api/logs", () => {
    it("should return 401 if missing token", async () => {
      const response = await request(app).post("/api/logs").send({
        name: "Apple",
        calories: 95,
      });
      expect(response.status).toBe(401);
    });

    it("should successfully create a food log", async () => {
      const response = await request(app)
        .post("/api/logs")
        .set("Authorization", `Bearer ${access_token}`)
        .send({
          name: "Apple",
          calories: 95,
          protein: 0.5,
          fat: 0.3,
          carbs: 25,
          source: "manual",
          quantity: 2,
          mealType: "snack",
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe("success");
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.quantity).toBe(2);
      expect(response.body.data.mealType).toBe("snack");

      createdLogId = response.body.data.id;
    });

    it("should create log with externalId and consumedAt", async () => {
      const response = await request(app)
        .post("/api/logs")
        .set("Authorization", `Bearer ${access_token}`)
        .send({
          name: "Banana",
          calories: 105,
          source: "api",
          externalId: "ext123",
          consumedAt: new Date().toISOString()
        });

      expect(response.status).toBe(201);
      expect(response.body.data.mealType).toBe("snack"); // Default mealType
    });

    it("should handle error during log creation", async () => {
      const { Food } = require("../models");
      jest.spyOn(Food, "findOrCreate").mockRejectedValueOnce(new Error("DB Error"));
      
      const response = await request(app)
        .post("/api/logs")
        .set("Authorization", `Bearer ${access_token}`)
        .send({ name: "Apple", calories: 95 });

      expect(response.status).toBe(500);
      jest.restoreAllMocks();
    });
  });

  describe("GET /api/logs", () => {
    it("should return 401 if missing token", async () => {
      const response = await request(app).get("/api/logs");
      expect(response.status).toBe(401);
    });

    it("should get all logs for user", async () => {
      const response = await request(app)
        .get("/api/logs")
        .set("Authorization", `Bearer ${access_token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toHaveProperty("total");
      expect(response.body.meta.total).toBeGreaterThan(0);
    });

    it("should handle error in get all logs", async () => {
      const { FoodLog } = require("../models");
      jest.spyOn(FoodLog, "findAll").mockRejectedValueOnce(new Error("DB error"));
      const response = await request(app)
        .get("/api/logs")
        .set("Authorization", `Bearer ${access_token}`);
      expect(response.status).toBe(500);
      jest.restoreAllMocks();
    });
  });

  describe("GET /api/logs/today", () => {
    it("should return 401 if missing token", async () => {
      const response = await request(app).get("/api/logs/today");
      expect(response.status).toBe(401);
    });

    it("should return daily summary logs along with totalCalories calculation", async () => {
      const response = await request(app)
        .get("/api/logs/today")
        .set("Authorization", `Bearer ${access_token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data).toHaveProperty("logs");
      expect(response.body.data).toHaveProperty("totalCalories");
      
      // Calculate is (Apple 95 cals * 2) + (Banana 105 cals * 1) = 295
      expect(response.body.data.totalCalories).toBe(295);
    });
  });

  describe("DELETE /api/logs/:id", () => {
    it("should return 401 if missing token", async () => {
      const response = await request(app).delete("/api/logs/1");
      expect(response.status).toBe(401);
    });

    it("should return 404 for non-existent log", async () => {
      const response = await request(app)
        .delete("/api/logs/999999")
        .set("Authorization", `Bearer ${access_token}`);

      expect(response.status).toBe(404);
    });

    it("should successfully delete the created log", async () => {
      const response = await request(app)
        .delete(`/api/logs/${createdLogId}`)
        .set("Authorization", `Bearer ${access_token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
    });
  });
});
