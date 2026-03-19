const express = require("express");
const FoodController = require("../controllers/foodController.js");
const authentication = require("../middlewares/authentication.js");
const { upload } = require("../middlewares/multer.js");
const { searchLimiter } = require("../middlewares/rateLimiter");

const router = express.Router();

router.get("/search", authentication, searchLimiter, FoodController.searchFood);

router.get("/:id", authentication, FoodController.getFoodDetail);

router.post(
  "/detect",
  authentication,
  upload.single("image"),
  FoodController.detectFood,
);

module.exports = router;
