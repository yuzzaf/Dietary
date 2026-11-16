const express = require("express");
const UserController = require("../controllers/userController.js");
const authentication = require("../middlewares/authentication.js");
const { upload } = require("../middlewares/multer.js");

const router = express.Router();

router.get("/profile", authentication, UserController.getProfile);
router.patch(
  "/profile-picture",
  authentication,
  upload.single("image"),
  UserController.updateProfilePicture,
);
router.patch("/profile", authentication, UserController.updateProfile);

module.exports = router;