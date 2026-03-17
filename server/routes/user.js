import express from "express";
import UserController from "../controllers/userController.js";
import { authentication } from "../middlewares/authentication.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();

// profile
router.get("/profile", authentication, UserController.getProfile);

// upload profile picture
router.patch(
  "/profile-picture",
  authentication,
  upload.single("image"),
  UserController.updateProfilePicture,
);

export default router;
