const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const router = require("./routes/index");
const errorHandler = require("./middlewares/errorHandler");
const morgan = require("morgan");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.use("/api", router);

// error handler
app.use(errorHandler);

module.exports = app;
