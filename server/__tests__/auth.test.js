const request = require("supertest");
const app = require("../app");
const { sequelize } = require("../models");

beforeAll(async () => {
  // Before auth tests run, clean Users table
  await sequelize.queryInterface.bulkDelete("Users", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
});

afterAll(async () => {
  await sequelize.close();
});

describe("Authentication Endpoints", () => {
  describe("POST /api/auth/register", () => {
    it("should successfully register a new user and return 201", async () => {
      const response = await request(app).post("/api/auth/register").send({
        email: "test@mail.com",
        password: "password123",
        firstName: "Test",
        lastName: "User",
      });

      expect(response.status).toBe(201);
      // Wait, register returns user object, let's just test status and email
      expect(response.body.email).toBe("test@mail.com");
    });

    it("should return 400 when email already exists", async () => {
      const response = await request(app).post("/api/auth/register").send({
        email: "test@mail.com",
        password: "password123",
        firstName: "Test",
        lastName: "User",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login successfully and return access_token", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "test@mail.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("access_token");
    });

    it("should return 401 when using wrong password", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "test@mail.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid email/password");
    });

    it("should return 401 when using unregistered email", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "notfound@mail.com",
        password: "password123",
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid email/password");
    });
  });
});
