const request = require("supertest");
const app = require("../app");
const { sequelize } = require("../models");
const { Food } = require("../models");

// Mock the services
jest.mock("../services/food.service", () => ({
  searchFood: jest.fn().mockResolvedValue([
    {
      id: "external-123",
      name: "Mock Apple",
      calories: 95,
      protein: 0.5,
      fat: 0.3,
      carbs: 25,
      source: "fatsecret",
      externalId: "external-123",
    },
  ]),
  detectFoodService: jest.fn().mockResolvedValue([
    {
      name: "Mock detected Apple",
      calories: 95,
      protein: 0.3,
      carbs: 25,
      fat: 0.2,
      confidence: 0.9,
    },
  ]),
}));

let access_token;
let foodId;

beforeAll(async () => {
  await sequelize.queryInterface.bulkDelete("Users", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
  await sequelize.queryInterface.bulkDelete("Foods", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });

  await request(app).post("/api/auth/register").send({
    email: "foodtest@mail.com",
    password: "password123",
    firstName: "Food",
    lastName: "Tester",
  });

  const res = await request(app).post("/api/auth/login").send({
    email: "foodtest@mail.com",
    password: "password123",
  });

  access_token = res.body.access_token;

  // Create a mock Food for GET /:id test
  const food = await Food.create({
    name: "Banana",
    calories: 105,
    protein: 1.3,
    fat: 0.4,
    carbs: 27,
    source: "manual",
  });
  foodId = food.id;
});

afterAll(async () => {
  await sequelize.close();
});

describe("Food Endpoints", () => {
  describe("GET /api/foods/search", () => {
    it("should return search results", async () => {
      const response = await request(app).get("/api/foods/search?q=apple");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.options[0].name).toBe("Mock Apple");
    });

    it("should return 400 if query is missing", async () => {
      const response = await request(app).get("/api/foods/search");
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Query is required");
    });
  });

  describe("GET /api/foods/:id", () => {
    it("should return food detail if found", async () => {
      const response = await request(app)
        .get(`/api/foods/${foodId}`)
        .set("Authorization", `Bearer ${access_token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.name).toBe("Banana");
    });

    it("should return 404 if food not found", async () => {
      const response = await request(app)
        .get(`/api/foods/999999`)
        .set("Authorization", `Bearer ${access_token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Food not found");
    });

    it("should return 401 if missing token", async () => {
      const response = await request(app).get(`/api/foods/${foodId}`);
      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/foods/detect", () => {
    it("should return detected food from image", async () => {
      const response = await request(app)
        .post("/api/foods/detect")
        // mock attach an image, any file since we mock the service anyway
        .attach("image", Buffer.from("fake-image"), "test.jpg");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data[0].name).toBe("Mock detected Apple");
    });
  });
});
