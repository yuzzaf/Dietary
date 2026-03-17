import express from "express";
import FoodController from "../controllers/foodController.js";
import { authentication } from "../middlewares/authentication.js";
import { upload } from "../middlewares/multer.js";

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

export default router;
