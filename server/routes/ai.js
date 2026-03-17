import express from "express";
import AIController from "../controllers/aiController.js";
import { authentication } from "../middlewares/authentication.js";

const router = express.Router();

// generate insight
router.post("/insight", authentication, AIController.generateInsight);

export default router;
