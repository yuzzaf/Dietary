const errorHandler = require("../middlewares/errorHandler");

describe("ErrorHandler Middleware", () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    console.error = jest.fn(); // Matikan console log error agar terminal test rapi
  });

  it("should handle BadRequest correctly", () => {
    const err = { name: "BadRequest", message: "Bad input" };
    errorHandler(err, mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "Bad input" });
  });

  it("should handle Sequelize errors as 400", () => {
    errorHandler({ name: "SequelizeValidationError" }, mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "Bad Request" }); // default message if err.message empty
  });

  it("should handle Unauthorized / JWT Error correctly", () => {
    const err = { name: "JsonWebTokenError", message: "Invalid token" };
    errorHandler(err, mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "Invalid token" });
  });

  it("should handle Forbidden as 403", () => {
    errorHandler({ name: "Forbidden" }, mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(403);
  });

  it("should handle NotFound as 404", () => {
    errorHandler({ name: "NotFound", message: "Data tidak ada" }, mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(404);
  });

  it("should handle TooManyRequests as 429", () => {
    errorHandler({ name: "TooManyRequests", message: "Limit" }, mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(429);
  });

  it("should handle unknown error as 500 Internal Server Error", () => {
    const err = new Error("Something exploded");
    errorHandler(err, mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Internal Server Error", detail: "Something exploded" })
    );
  });
});
