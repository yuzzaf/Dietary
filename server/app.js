const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const helmet = require("helmet");
const router = require("./routes/index");
const errorHandler = require("./middlewares/errorHandler");
const morgan = require("morgan");
const cors = require("cors");
const { apiLimiter } = require("./middlewares/rateLimiter");

const app = express();

app.set("trust proxy", 1);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running!" });
});

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim().replace(/\/$/, ""))
  : ["http://localhost:5173"];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const normalizedOrigin = origin.replace(/\/$/, "");
    if (
      allowedOrigins.includes("*") ||
      allowedOrigins.includes(normalizedOrigin) ||
      /^http:\/\/localhost(:\d+)?$/.test(origin)
    ) {
      return callback(null, true);
    }
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
};

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.use("/api", apiLimiter, router);
app.use(errorHandler);

module.exports = app;