const express = require("express");
const FoodController = require("../controllers/foodController.js");
const authentication = require("../middlewares/authentication.js");
// const upload = require("../helpers/multer.js");
const { searchLimiter } = require("../middlewares/rateLimiter");

const router = express.Router();

// search food (API)
router.get("/search", authentication, searchLimiter, FoodController.searchFood);

// detail food
router.get("/:id", authentication, FoodController.getFoodDetail);

// detect via image
// router.post(
//   "/detect",
//   authentication,
//   upload.single("image"),
//   FoodController.detectFood,
// );

module.exports = router;
