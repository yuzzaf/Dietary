const { User } = require("../models");
const errorHandler = require("../middlewares/errorHandler");

describe("Core functionality", () => {
  it("should return User full name correctly", () => {
    const user1 = User.build({ firstName: "John", lastName: "Doe" });
    expect(user1.fullName).toBe("John Doe");

    const user2 = User.build({ firstName: "John" });
    expect(user2.fullName).toBe("John");
    
    const user3 = User.build({ lastName: "Doe" });
    expect(user3.fullName).toBe("Doe");
  });

  describe("errorHandler coverage", () => {
    it("should handle MulterError", () => {
      const err = { name: "MulterError", message: "File too large" };
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      errorHandler(err, req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should handle TokenExpiredError", () => {
      const err = { name: "TokenExpiredError", message: "Token expired" };
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      errorHandler(err, req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it("should handle current error with fallback message", () => {
      const err = { name: "BadRequest" }; // no message
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      errorHandler(err, req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Bad Request" });
    });
    
    it("should handle TooManyRequests", () => {
      const err = { name: "TooManyRequests" };
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      errorHandler(err, req, res, next);
      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({ message: "Too Many Requests" });
    });

    it("should handle Forbidden", () => {
      const err = { name: "Forbidden" };
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      errorHandler(err, req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "Forbidden" });
    });
  });
});
