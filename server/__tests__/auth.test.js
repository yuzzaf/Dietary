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

    it("should return 400 when email is not provided", async () => {
      const response = await request(app).post("/api/auth/register").send({
        password: "password123",
        firstName: "Test",
        lastName: "User",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Email & password required");
    });

    it("should return 400 when password is not provided", async () => {
      const response = await request(app).post("/api/auth/register").send({
        email: "no-pass@mail.com",
        firstName: "Test",
        lastName: "User",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Email & password required");
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

    it("should return 400 when email is not provided", async () => {
      const response = await request(app).post("/api/auth/login").send({
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Email & password required");
    });

    it("should return 400 when password is not provided", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "test@mail.com",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Email & password required");
    });
  });

  describe("POST /api/auth/google-login", () => {
    it("should return 400 when Google token is not provided", async () => {
      const response = await request(app).post("/api/auth/google-login").send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Google token required");
    });
  });

  describe("POST /api/auth/github-login", () => {
    it("should return 400 when GitHub code is not provided", async () => {
      const response = await request(app).post("/api/auth/github-login").send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("GitHub code required");
    });
  });
});
