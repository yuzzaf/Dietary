const express = require("express");
const FoodController = require("../controllers/foodController.js");
const { authentication } = require("../middlewares/authentication.js");
const { upload } = require("../middlewares/multer.js");

const router = express.Router();

// search food (API)
router.get("/search", authentication, FoodController.searchFood);

// detail food
router.get("/:id", authentication, FoodController.getFoodDetail);

// manual add (optional)
router.post("/", authentication, FoodController.createFood);

// detect via image
router.post(
  "/detect",
  authentication,
  upload.single("image"),
  FoodController.detectFood,
);

module.exports = router;
