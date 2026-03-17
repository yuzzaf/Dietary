import express from "express";
import LogController from "../controllers/logController.js";
import { authentication } from "../middlewares/authentication.js";
import { authorizeFoodLog } from "../middlewares/authorization.js";

const router = express.Router();

// get logs
router.get("/", authentication, LogController.getLogs);

// add log
router.post("/", authentication, LogController.createLog);

// delete log
router.delete(
  "/:id",
  authentication,
  authorizeFoodLog,
  LogController.deleteLog,
);

export default router;
