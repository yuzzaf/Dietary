const authentication = require("../middlewares/authentication");
const authorizeFoodLog = require("../middlewares/authorization");
const { upload } = require("../middlewares/multer");
const { User, FoodLog } = require("../models");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const express = require("express");

jest.mock("jsonwebtoken");
jest.mock("../models");

describe("Middlewares", () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = { headers: {}, params: {}, user: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe("Authentication Middleware", () => {
    it("should return 401 if missing authorization header", async () => {
      await authentication(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Unauthorized" });
    });

    it("should return 401 if token is invalid/jwt error", async () => {
      mockReq.headers.authorization = "Bearer invalidtoken";
      jwt.verify.mockImplementation(() => {
        throw new Error("jwt malformed");
      });

      await authentication(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it("should return 401 if user not found in database", async () => {
      mockReq.headers.authorization = "Bearer validtoken";
      jwt.verify.mockReturnValue({ id: 99 });
      User.findByPk.mockResolvedValue(null);

      await authentication(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Invalid token" });
    });

    it("should pass and attach user to req if token and user are valid", async () => {
      mockReq.headers.authorization = "Bearer validtoken";
      jwt.verify.mockReturnValue({ id: 1 });
      User.findByPk.mockResolvedValue({ id: 1, email: "test@mail.com" });

      await authentication(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toEqual({ id: 1, email: "test@mail.com" });
    });
  });

  describe("Authorization Middleware", () => {
    it("should return 404 if FoodLog is not found", async () => {
      mockReq.params.id = 99;
      FoodLog.findByPk.mockResolvedValue(null);

      await authorizeFoodLog(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Data not found" });
    });

    it("should return 403 if user does not own the log", async () => {
      mockReq.params.id = 1;
      mockReq.user.id = 2; // currently logged in as user 2
      FoodLog.findByPk.mockResolvedValue({ id: 1, userId: 1 }); // log owned by user 1

      await authorizeFoodLog(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Forbidden" });
    });

    it("should pass if user owns the log", async () => {
      mockReq.params.id = 1;
      mockReq.user.id = 1;
      FoodLog.findByPk.mockResolvedValue({ id: 1, userId: 1 });

      await authorizeFoodLog(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it("should return 500 on database error", async () => {
      mockReq.params.id = 1;
      FoodLog.findByPk.mockRejectedValue(new Error("DB Error"));

      await authorizeFoodLog(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe("Multer Middleware (File Filter)", () => {
    const app = express();
    // dummy endpoint
    app.post("/test-upload", upload.single("image"), (req, res) => {
      res.status(200).json({ message: "Upload success" });
    });
    // error handler hook
    app.use((err, req, res, next) => {
      res.status(400).json({ message: err.message });
    });

    it("should reject non-image files like pdf", async () => {
      const res = await request(app)
        .post("/test-upload")
        .attach("image", Buffer.from("fake-pdf"), "document.pdf", {
          contentType: "application/pdf",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid file type");
    });
    
    it("should accept image files", async () => {
      const res = await request(app)
        .post("/test-upload")
        .attach("image", Buffer.from("fake-image"), "photo.jpg", {
          contentType: "image/jpeg",
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Upload success");
    });
  });
});
