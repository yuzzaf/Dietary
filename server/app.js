const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
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

const corsOptions = {
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.use("/api", apiLimiter, router);

// error handler
app.use(errorHandler);

module.exports = app;
