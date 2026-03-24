const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  message: { message: "Too many requests from this IP, please try again later" },
  standardHeaders: true, 
  legacyHeaders: false, 
});

const searchLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 20, // Limit each IP to 20 search requests
  message: { message: "Too many search requests" },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { apiLimiter, searchLimiter };
