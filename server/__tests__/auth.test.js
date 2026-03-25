const request = require("supertest");
const app = require("../app");
const { sequelize, User } = require("../models");
const crypto = require("crypto");
const { hashPassword } = require("../helpers/bcrypt");
const nock = require("nock");

jest.mock("google-auth-library", () => {
  return {
    OAuth2Client: jest.fn().mockImplementation(() => {
      return {
        verifyIdToken: jest.fn().mockResolvedValue({
          getPayload: () => ({
            email: "googleuser@mail.com",
            given_name: "Google",
            family_name: "User",
            sub: "1234567890"
          })
        })
      };
    })
  };
});


jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue(true),
  }),
}));

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
    it("should successfully login with google token", async () => {
      const response = await request(app).post("/api/auth/google-login").send({
        id_token: "dummy_google_token",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("access_token");
    });

    it("should login successfully and link googleId to existing user", async () => {
      // Create user without googleId
      await User.findOrCreate({
        where: { email: "googleuser@mail.com" },
        defaults: {
          password: "password123",
          firstName: "Google",
          lastName: "User",
        }
      });

      const response = await request(app).post("/api/auth/google-login").send({
        id_token: "dummy_google_token",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("access_token");

      // Verify that googleId was added
      const user = await User.findOne({ where: { email: "googleuser@mail.com" } });
      expect(user.googleId).toBe("1234567890");
    });

    it("should return 400 when Google token is not provided", async () => {
      const response = await request(app).post("/api/auth/google-login").send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Google token required");
    });
  });

  describe("POST /api/auth/github-login", () => {
    it("should successfully login with github code", async () => {
      nock("https://github.com")
        .post("/login/oauth/access_token")
        .reply(200, { access_token: "dummy_github_token" });

      nock("https://api.github.com")
        .get("/user")
        .reply(200, {
          id: 12345,
          name: "Github User",
          login: "githubuser",
          email: "githubuser@mail.com",
          avatar_url: "dummy_url",
        });

      nock("https://api.github.com")
        .get("/user/emails")
        .reply(200, [
          { email: "githubuser@mail.com", primary: true, verified: true },
        ]);

      const response = await request(app).post("/api/auth/github-login").send({
        code: "dummy_github_code",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("access_token");
    });

    it("should return error from github", async () => {
      nock("https://github.com")
        .post("/login/oauth/access_token")
        .reply(200, { error: "bad_verification_code", error_description: "The code passed is incorrect or expired." });

      const response = await request(app).post("/api/auth/github-login").send({
        code: "dummy_invalid_github_code",
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("The code passed is incorrect or expired.");
    });

    it("should return 401 when github profile is missing id", async () => {
      nock("https://github.com")
        .post("/login/oauth/access_token")
        .reply(200, { access_token: "dummy_github_token" });

      nock("https://api.github.com")
        .get("/user")
        .reply(200, { message: "Bad credentials" });

      const response = await request(app).post("/api/auth/github-login").send({
        code: "dummy_code_no_profile",
      });

      expect(response.status).toBe(401);
    });

    it("should return 400 when github primary email not found", async () => {
      nock("https://github.com")
        .post("/login/oauth/access_token")
        .reply(200, { access_token: "dummy_github_token" });

      nock("https://api.github.com")
        .get("/user")
        .reply(200, { id: 12345, login: "githubuser" }); // no email

      nock("https://api.github.com")
        .get("/user/emails")
        .reply(200, []); // no emails array returned

      const response = await request(app).post("/api/auth/github-login").send({
        code: "dummy_code_no_email",
      });

      expect(response.status).toBe(400);
    });

    it("should login successfully and link githubId to existing user", async () => {
      await User.findOrCreate({
        where: { email: "githubuser2@mail.com" },
        defaults: {
          password: "password123",
          firstName: "Github",
          lastName: "User",
        }
      });

      nock("https://github.com")
        .post("/login/oauth/access_token")
        .reply(200, { access_token: "dummy_github_token" });

      nock("https://api.github.com")
        .get("/user")
        .reply(200, { id: 54321, login: "githubuser2", email: "githubuser2@mail.com" });

      nock("https://api.github.com")
        .get("/user/emails")
        .reply(200, [{ email: "githubuser2@mail.com", primary: true }]);

      const response = await request(app).post("/api/auth/github-login").send({
        code: "dummy_github_code_link",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("access_token");

      const user = await User.findOne({ where: { email: "githubuser2@mail.com" } });
      expect(user.githubId).toBe("54321");
    });

    it("should return 400 when GitHub code is not provided", async () => {
      const response = await request(app).post("/api/auth/github-login").send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("GitHub code required");
    });
  });

  describe("POST /api/auth/forgot-password", () => {
    it("should successfully send reset link for registered email", async () => {
      const response = await request(app).post("/api/auth/forgot-password").send({
        email: "test@mail.com",
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("If that email is registered, a reset link has been sent.");
    });

    it("should still return 200 for unregistered email (prevent email enumeration)", async () => {
      const response = await request(app).post("/api/auth/forgot-password").send({
        email: "notFound123@mail.com",
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("If that email is registered, a reset link has been sent.");
    });

    it("should return 400 when email is missing", async () => {
      const response = await request(app).post("/api/auth/forgot-password").send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Email required");
    });
  });

  describe("POST /api/auth/reset-password", () => {
    let validToken;
    beforeAll(async () => {
      // Setup a user with valid token first
      const resetUser = await User.findOne({ where: { email: "test@mail.com" } });
      validToken = crypto.randomBytes(32).toString("hex");
      if (resetUser) {
        resetUser.resetPasswordToken = validToken;
        resetUser.resetPasswordExpires = Date.now() + 3600000;
        await resetUser.save();
      }
    });

    it("should return 400 when token and password missing", async () => {
      const response = await request(app).post("/api/auth/reset-password").send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Token and new password required");
    });

    it("should return 400 for invalid token", async () => {
      const response = await request(app).post("/api/auth/reset-password").send({
        token: "invalidToken12345",
        newPassword: "newpassword123"
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid or expired password reset token");
    });

    it("should successfully reset password with valid token", async () => {
      const response = await request(app).post("/api/auth/reset-password").send({
        token: validToken,
        newPassword: "supernewpassword"
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Password has been successfully reset");
      
      // Verify login with new password
      const loginRes = await request(app).post("/api/auth/login").send({
        email: "test@mail.com",
        password: "supernewpassword",
      });
      expect(loginRes.status).toBe(200);
    });
  });
});
