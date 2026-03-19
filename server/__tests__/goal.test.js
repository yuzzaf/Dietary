const request = require("supertest");
const app = require("../app");
const { sequelize } = require("../models");

let access_token;

beforeAll(async () => {
  await sequelize.queryInterface.bulkDelete("Users", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });

  // Register and login to get token
  await request(app).post("/api/auth/register").send({
    email: "goaltest@mail.com",
    password: "password123",
    firstName: "Goal",
    lastName: "User",
  });

  const res = await request(app).post("/api/auth/login").send({
    email: "goaltest@mail.com",
    password: "password123",
  });

  access_token = res.body.access_token;
});

afterAll(async () => {
  await sequelize.close();
});

describe("Goal Endpoints", () => {
  describe("GET /api/goals", () => {
    it("should return null if user has no goal", async () => {
      const response = await request(app)
        .get("/api/goals")
        .set("Authorization", `Bearer ${access_token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data).toBeNull();
    });

    it("should return 401 if missing token", async () => {
      const response = await request(app).get("/api/goals");
      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/goals", () => {
    it("should create a new goal if it doesn't exist", async () => {
      const response = await request(app)
        .post("/api/goals")
        .set("Authorization", `Bearer ${access_token}`)
        .send({ goalType: "cutting", targetCalories: 1500 });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.goalType).toBe("cutting");
      expect(response.body.data.targetCalories).toBe(1500);
    });

    it("should update existing goal", async () => {
      const response = await request(app)
        .post("/api/goals")
        .set("Authorization", `Bearer ${access_token}`)
        .send({ goalType: "bulking", targetCalories: 2500 });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.goalType).toBe("bulking");
      expect(response.body.data.targetCalories).toBe(2500);
    });
  });
});
