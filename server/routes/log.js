const express = require("express");
const LogController = require("../controllers/logController.js");
const { authentication } = require("../middlewares/authentication.js");
const { authorizeFoodLog } = require("../middlewares/authorization.js");

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

module.exports = router;
