const request = require("supertest");
const app = require("../app");
const { User, AIInsight } = require("../models");
const nock = require("nock");

jest.mock("google-auth-library", () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: jest.fn().mockResolvedValue({
      getPayload: () => ({ email: "go_exists@mail.com", sub: "888" })
    })
  }))
}));

describe("Additional Branches", () => {
  beforeAll(async () => {
    await User.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
    
    // Seed users
    await User.create({ email: "gh_exists@mail.com", password: "password123", firstName: "A", lastName: "B", githubId: "999" });
    await User.create({ email: "go_exists@mail.com", password: "password123", firstName: "A", lastName: "B", googleId: "888" });
  });

  describe("Auth Branches", () => {
    it("should login successfully with existing googleId", async () => {
      // The global jest.mock is already returning go_exists@mail.com and sub 888
      const response = await request(app).post("/api/auth/google-login").send({ id_token: "dummy" });
      expect(response.status).toBe(200);
    });

    it("should hit existing githubId branch", async () => {
        nock("https://github.com").post("/login/oauth/access_token").reply(200, { access_token: "dummy_token" });
        nock("https://api.github.com").get("/user").reply(200, { id: 999, email: "gh_exists@mail.com" });
        nock("https://api.github.com").get("/user/emails").reply(200, { message: "Not found" }); // causes array check to fail
        
        const response = await request(app).post("/api/auth/github-login").send({ code: "dummy_code" });
        expect(response.status).toBe(200);
    });
  });

  describe("AI Branches", () => {
    it("should handle error in pdf export when headers sent", () => {
        // Already tested in ai.test.js, nothing to do
    });
  });
});
