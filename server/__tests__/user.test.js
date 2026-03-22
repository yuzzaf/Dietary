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

  await request(app).post("/api/auth/register").send({
    email: "usertest@mail.com",
    password: "password123",
    firstName: "User",
    lastName: "Tester",
  });

  const res = await request(app).post("/api/auth/login").send({
    email: "usertest@mail.com",
    password: "password123",
  });

  access_token = res.body.access_token;
});

afterAll(async () => {
  await sequelize.close();
});

describe("User Endpoints", () => {
  describe("GET /api/users/profile", () => {
    it("should return user profile", async () => {
      const response = await request(app)
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${access_token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("email", "usertest@mail.com");
      expect(response.body).not.toHaveProperty("password");
    });

    it("should return 401 if token is missing", async () => {
      const response = await request(app).get("/api/users/profile");
      expect(response.status).toBe(401);
    });
  });

  describe("PATCH /api/users/profile", () => {
    it("should successfully update profile", async () => {
      const response = await request(app)
        .patch("/api/users/profile")
        .set("Authorization", `Bearer ${access_token}`)
        .send({
          weight: 70,
          height: 175,
          age: 25,
          gender: "Male",
          activityLevel: "Moderate",
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Profile updated");
      expect(response.body.user.weight).toBe(70);
      expect(response.body.user.height).toBe(175);
      expect(response.body.user.age).toBe(25);
    });

    it("should return 401 if token is missing", async () => {
      const response = await request(app).patch("/api/users/profile").send({
        weight: 70,
      });
      expect(response.status).toBe(401);
    });
  });
});
