import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  getUserchannelProfile,
  getWatchHistroy,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);
//inject middlewares before functions that going to be execute
router.route("/login").post(loginUser);
//securing routes-->

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router
  .route("/avatar-update")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router
  .route("/coverImage-update")
  .patch(verifyJWT, upload.single("/ccoverImage"), updateUserCoverImage);
router.route("/c/:username").get(verifyJWT, getUserchannelProfile);
router.route("/watchHistory").get(verifyJWT, getWatchHistroy);

export default router;
