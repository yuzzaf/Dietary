const express = require("express");
const authRouter = require("./auth.js");
// const userRouter = require("./user.js");
// const foodRouter = require("./food.js");
// const logRouter = require("./log.js");
// const aiRouter = require("./ai.js");

const router = express.Router();

router.use("/auth", authRouter);
// router.use("/users", userRouter);
// router.use("/foods", foodRouter);
// router.use("/logs", logRouter);
// router.use("/ai", aiRouter);

module.exports = router;
