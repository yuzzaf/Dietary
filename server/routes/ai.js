const express = require("express");
const AIController = require("../controllers/aiController.js");
const authentication = require("../middlewares/authentication.js");

const router = express.Router();

// generate insight
router.get("/insight", authentication, AIController.generateInsight);

module.exports = router;
