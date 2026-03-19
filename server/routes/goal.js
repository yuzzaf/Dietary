const express = require("express");
const GoalController = require("../controllers/goalController.js");
const authentication = require("../middlewares/authentication.js");

const router = express.Router();

router.get("/", authentication, GoalController.getGoal);
router.post("/", authentication, GoalController.upsertGoal);

module.exports = router;
