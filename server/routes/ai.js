const express = require("express");
const AIController = require("../controllers/aiController.js");
const authentication = require("../middlewares/authentication.js");

const router = express.Router();

router.get("/insight", authentication, AIController.generateInsight);
router.get("/insight/weekly", authentication, AIController.getInsightsWeekly);
router.get("/insight/export", authentication, AIController.exportInsightWeeklyPdf);
router.post("/chat", authentication, AIController.handleChat);

module.exports = router;
