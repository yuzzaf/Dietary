import express from "express";
import authRouter from "./auth.js";
import userRouter from "./user.js";
import foodRouter from "./food.js";
import logRouter from "./log.js";
import aiRouter from "./ai.js";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/foods", foodRouter);
router.use("/logs", logRouter);
router.use("/ai", aiRouter);

export default router;
