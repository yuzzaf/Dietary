const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 1000,
  message: {
    message: "Too many requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 menit
  max: 100,

  message: {
    message: "Too many search requests",
  },
});

module.exports = { apiLimiter, searchLimiter };
