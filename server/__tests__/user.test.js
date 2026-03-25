const request = require("supertest");
const app = require("../app");
const { sequelize, User } = require("../models");
const { signToken } = require("../helpers/jwt");

jest.mock("../helpers/cloudinary", () => ({
  uploader: {
    upload_stream: jest.fn().mockImplementation((options, callback) => {
      const { Writable } = require('stream');
      const mockStream = new Writable({
        write(chunk, encoding, next) {
          next();
        },
        final(next) {
          if (options.folder === "error_test") {
            callback(new Error("Upload failed"), null);
          } else {
            callback(null, { secure_url: "dummy_image_url" });
          }
          next();
        }
      });
      return mockStream;
    })
  }
}));

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

    it("should return not found if user is deleted", async () => {
      jest.spyOn(User, "findByPk").mockResolvedValueOnce({ id: 1, email: "test@mail.com" }).mockResolvedValueOnce(null);
      const response = await request(app)
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${access_token}`);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("User not found");
      jest.restoreAllMocks();
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

    it("should return not found if user is deleted", async () => {
      jest.spyOn(User, "findByPk").mockResolvedValueOnce({ id: 1, email: "test@mail.com" }).mockResolvedValueOnce(null);
      const response = await request(app)
        .patch("/api/users/profile")
        .set("Authorization", `Bearer ${access_token}`)
        .send({ weight: 70 });
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("User not found");
      jest.restoreAllMocks();
    });

    it("should return 401 if token is missing", async () => {
      const response = await request(app).patch("/api/users/profile").send({
        weight: 70,
      });
      expect(response.status).toBe(401);
    });
  });

  describe("PATCH /api/users/profile-picture", () => {
    it("should return 400 if image is not provided", async () => {
      const response = await request(app)
        .patch("/api/users/profile-picture")
        .set("Authorization", `Bearer ${access_token}`);
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Image is required");
    });

    it("should successfully update profile picture", async () => {
      const response = await request(app)
        .patch("/api/users/profile-picture")
        .set("Authorization", `Bearer ${access_token}`)
        .attach("image", Buffer.from("dummy_image"), "dummy.png");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Profile picture updated");
      expect(response.body.imageUrl).toBe("dummy_image_url");
    });

    it("should return 404 if user not found", async () => {
      jest.spyOn(User, "findByPk").mockResolvedValueOnce({ id: 1, email: "test@mail.com" }).mockResolvedValueOnce(null);
      const response = await request(app)
        .patch("/api/users/profile-picture")
        .set("Authorization", `Bearer ${access_token}`)
        .attach("image", Buffer.from("dummy_image"), "dummy.png");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("User not found");
      jest.restoreAllMocks();
    });
  });
});
