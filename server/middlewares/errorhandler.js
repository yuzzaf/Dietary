const errorHandler = (err, req, res, next) => {
  switch (err.name) {
    case "BadRequest":
    case "SequelizeValidationError":
    case "SequelizeUniqueConstraintError":
    case "MulterError":
      return res.status(400).json({ message: err.message || "Bad Request" });
    case "Unauthorized":
    case "JsonWebTokenError":
    case "TokenExpiredError":
      return res.status(401).json({ message: err.message || "Unauthorized" });
    case "Forbidden":
      return res.status(403).json({ message: err.message || "Forbidden" });
    case "NotFound":
      return res.status(404).json({ message: err.message || "Not Found" });
    case "TooManyRequests":
      return res.status(429).json({ message: err.message || "Too Many Requests" });
    default:
      console.error("GLOBAL ERROR HANDLER:", err);
      return res.status(500).json({ message: "Internal Server Error", detail: err.message, stack: err.stack });
  }
};

module.exports = errorHandler;
