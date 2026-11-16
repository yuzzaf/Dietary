const express = require("express");
const LogController = require("../controllers/logController.js");
const authentication = require("../middlewares/authentication.js");
const authorizeFoodLog = require("../middlewares/authorization.js");

const router = express.Router();

router.get("/", authentication, LogController.getLogs);
router.get("/today", authentication, LogController.getLogsToday);
router.post("/", authentication, LogController.createLog);
router.delete(
  "/:id",
  authentication,
  authorizeFoodLog,
  LogController.deleteLog,
);

module.exports = router;