import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    registerUser
);
//inject middlewares before functions that going to be execute 
router.route("/login").post(loginUser)
//securing routes-->


router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh").post(refreshAccessToken)
export default router;
