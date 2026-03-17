require("dotenv").config();
import express from "express";
import router from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(express.json());

// routes
app.use("/api", router);

// error handler
app.use(errorHandler);

export default app;
