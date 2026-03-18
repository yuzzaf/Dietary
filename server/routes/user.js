const express = require("express");
const UserController = require("../controllers/userController.js");
const authentication = require("../middlewares/authentication.js");
const { upload } = require("../middlewares/multer.js");

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

// update profile
router.patch("/profile", authentication, UserController.updateProfile);

module.exports = router;
