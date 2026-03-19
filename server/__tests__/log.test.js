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
  });

  describe("GET /api/logs", () => {
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
  });

  describe("GET /api/logs/today", () => {
    it("should return daily summary logs along with totalCalories calculation", async () => {
      const response = await request(app)
        .get("/api/logs/today")
        .set("Authorization", `Bearer ${access_token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data).toHaveProperty("logs");
      expect(response.body.data).toHaveProperty("totalCalories");
      
      // Calculate is 95 cals * 2 quantity = 190
      expect(response.body.data.totalCalories).toBe(190);
    });
  });

  describe("DELETE /api/logs/:id", () => {
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
